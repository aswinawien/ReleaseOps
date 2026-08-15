export type ActionOk<T> = { ok: true; data: T };
export type ActionErr = { ok: false; error: string };
export type ActionResult<T> = ActionOk<T> | ActionErr;

export function actionOk<T>(data: T): ActionOk<T> {
  return { ok: true, data };
}

export function actionErr(error: string): ActionErr {
  return { ok: false, error };
}

export function fromUnknownError(error: unknown, fallback: string): ActionErr {
  if (error instanceof Error && error.message) {
    return actionErr(error.message);
  }
  return actionErr(fallback);
}
