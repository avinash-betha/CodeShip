import {
  type Project,
  type ElementNode,
  currentPage,
  voidTags,
  svgTagName,
} from "../document-model";
import {
  type ExportFiles,
  escapeHtml,
  interactionScript,
  projectCss,
} from "../codegen-core";
import { safeAttribute } from "../validation";
const angularText = (text: string) =>
  escapeHtml(text)
    .replaceAll("@", "&#64;")
    .replaceAll("{", "&#123;")
    .replaceAll("}", "&#125;");
export function angularTemplate(n: ElementNode): string {
  const attrs = Object.entries(n.attributes)
    .filter(([k, v]) => safeAttribute(k, v))
    .map(([k, v]) => ` ${k}="${angularText(v)}"`)
    .join("");
  const tag = svgTagName(n.tag);
  const open = `<${tag} data-cs-id="${n.id}"${attrs}>`;
  return voidTags.has(n.tag)
    ? open
    : `${open}${angularText(n.text)}${n.children.map(angularTemplate).join("")}</${tag}>`;
}
export function exportAngular(project: Project): ExportFiles {
  const page = currentPage(project),
    script = interactionScript(page),
    files: ExportFiles = {
      "package.json": JSON.stringify(
        {
          name: "codeship-angular-export",
          private: true,
          scripts: { start: "ng serve", build: "ng build" },
          dependencies: {
            "@angular/common": "^21.2.25",
            "@angular/compiler": "^21.2.25",
            "@angular/core": "^21.2.25",
            "@angular/platform-browser": "^21.2.25",
            "@angular/router": "^21.2.25",
            rxjs: "^7.8.2",
            tslib: "^2.8.1",
          },
          devDependencies: {
            "@angular/build": "^21.2.27",
            "@angular/cli": "^21.2.27",
            "@angular/compiler-cli": "^21.2.25",
            typescript: "~5.9.3",
          },
        },
        null,
        2,
      ),
      "angular.json": JSON.stringify(
        {
          version: 1,
          projects: {
            app: {
              projectType: "application",
              root: "",
              sourceRoot: "src",
              architect: {
                build: {
                  builder: "@angular/build:application",
                  options: {
                    browser: "src/main.ts",
                    index: "src/index.html",
                    tsConfig: "tsconfig.json",
                    styles: ["src/styles.css"],
                    assets: [{ glob: "**/*", input: "public", output: "/" }],
                    outputPath: "dist/app",
                  },
                },
                serve: {
                  builder: "@angular/build:dev-server",
                  options: { buildTarget: "app:build" },
                },
              },
            },
          },
        },
        null,
        2,
      ),
      "tsconfig.json": JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            module: "ESNext",
            moduleResolution: "bundler",
            lib: ["ES2022", "DOM"],
            strict: true,
            experimentalDecorators: true,
            useDefineForClassFields: false,
            skipLibCheck: true,
          },
          angularCompilerOptions: { strictTemplates: true },
          include: ["src/**/*.ts"],
        },
        null,
        2,
      ),
      "src/index.html":
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>CodeShip export</title><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/"></head><body><app-root></app-root></body></html>',
      "src/main.ts": `import { bootstrapApplication } from '@angular/platform-browser';\nimport { provideRouter } from '@angular/router';\nimport { ShellComponent } from './shell.component';\nimport { routes } from './routes';\nbootstrapApplication(ShellComponent,{providers:[provideRouter(routes)]}).catch(console.error);`,
      "src/shell.component.ts": `import { Component } from '@angular/core';\nimport { RouterOutlet } from '@angular/router';\n@Component({selector:'app-root',standalone:true,imports:[RouterOutlet],template:'<router-outlet />'})\nexport class ShellComponent {}`,
      "src/app.component.ts": `import { Component, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, OnDestroy } from '@angular/core';\n@Component({selector:'page-active', standalone:true, schemas:[CUSTOM_ELEMENTS_SCHEMA], templateUrl:'./app.component.html'})\nexport class AppComponent implements AfterViewInit, OnDestroy { private controller?:AbortController; ngAfterViewInit():void { ${script} ${script ? "this.controller=interactionController;" : ""} } ngOnDestroy():void {this.controller?.abort();} }`,
      "src/app.component.html": angularTemplate(page.root),
      "src/styles.css": projectCss(project),
      "README.md": `# ${project.name}\n\nNode 20.19+ is required. Run npm install, then npm start or npm run build.\n\nThe active page is the default route. Other pages are connected through src/routes.ts. Reusable definitions are standalone components under src/components. No CodeShip editor runtime is required.\n`,
    };
  const routeImports = ["import { AppComponent } from './app.component';"];
  const routes = ["{path:'',component:AppComponent,pathMatch:'full'}"];
  const usedPaths = new Set<string>([""]);
  for (const other of project.pages.filter((p) => p.id !== page.id)) {
    const filename = other.id.replaceAll("-", "");
    files[`src/pages/${filename}.ts`] =
      `import { Component, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, OnDestroy } from '@angular/core';\n@Component({selector:'page-${other.id}',standalone:true,schemas:[CUSTOM_ELEMENTS_SCHEMA],templateUrl:'./${filename}.html',styleUrl:'./${filename}.css'})\nexport class Page${filename} implements AfterViewInit, OnDestroy { private controller?:AbortController; ngAfterViewInit(): void { ${interactionScript(other)} ${interactionScript(other) ? "this.controller=interactionController;" : ""} } ngOnDestroy():void{this.controller?.abort();} }`;
    files[`src/pages/${filename}.html`] = angularTemplate(other.root);
    files[`src/pages/${filename}.css`] = projectCss(project, other);
    let path =
      other.path.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9_/-]/g, "-") ||
      other.id;
    if (usedPaths.has(path)) path = other.id;
    usedPaths.add(path);
    routeImports.push(`import { Page${filename} } from './pages/${filename}';`);
    routes.push(`{path:${JSON.stringify(path)},component:Page${filename}}`);
  }
  files["src/routes.ts"] =
    `import type { Routes } from '@angular/router';\n${routeImports.join("\n")}\nexport const routes:Routes=[${routes.join(",")}];`;
  for (const component of project.components) {
    const filename = component.id.replaceAll("-", "");
    files[`src/components/${filename}.ts`] =
      `import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';\n@Component({selector:'block-${component.id}',standalone:true,schemas:[CUSTOM_ELEMENTS_SCHEMA],templateUrl:'./${filename}.html',styleUrl:'./${filename}.css'})\nexport class Block${filename} {}`;
    files[`src/components/${filename}.html`] = angularTemplate(component.root);
    files[`src/components/${filename}.css`] = component.css;
  }
  return files;
}
