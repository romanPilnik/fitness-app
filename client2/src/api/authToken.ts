type TokenReader = () => string | null;

let readToken: TokenReader = () => null;

export function setAuthTokenReader(reader: TokenReader): void {
  readToken = reader;
}

export function getAuthToken(): string | null {
  return readToken();
}
