type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler = () => {
  window.location.assign('/login');
};

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized(): void {
  unauthorizedHandler();
}
