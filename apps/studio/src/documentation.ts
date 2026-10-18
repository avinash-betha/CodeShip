export function codeTokens(code: string): { text: string; kind: string }[] {
  return code
    .split(
      /("[^"\n]*"|'[^'\n]*'|\/\*[^]*?\*\/|\b(?:import|from|export|default|function|return|class|const|new|if|true|false)\b|#[a-fA-F0-9]{3,8}\b|\b\d+(?:px|ms|%)?\b)/g,
    )
    .filter(Boolean)
    .map((text) => ({
      text,
      kind: /^["']/.test(text)
        ? "string"
        : /^\/\*/.test(text)
          ? "comment"
          : /^(?:\d|#)/.test(text)
            ? "number"
            : /^(?:import|from|export|default|function|return|class|const|new|if|true|false)$/.test(
                  text,
                )
              ? "keyword"
              : "",
    }));
}
