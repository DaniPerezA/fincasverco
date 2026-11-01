import { createServerFn } from "@tanstack/react-start";

function asRecord(input: unknown): Record<string, unknown> {
  if (typeof input === "object" && input !== null && !Array.isArray(input)) {
    return input as Record<string, unknown>;
  }
  return {};
}

function pick(record: Record<string, unknown>, key: string): unknown {
  return record[key];
}

function asString(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function asSecret(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.slice(0, max);
}

function failure(error: unknown): { ok: false; error: string } {
  console.error(error);
  return { ok: false, error: "No se ha podido completar la operación. Inténtelo de nuevo." };
}

export const lookupOwner = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ nif: asString(pick(asRecord(input), "nif"), 32) }))
  .handler(async ({ data }) => {
    try {
      const { lookupOwnerStatus } = await import("@/server/owners");
      return await lookupOwnerStatus(data.nif);
    } catch (error) {
      console.error(error);
      return {
        status: "invalid" as const,
        error: "No se ha podido comprobar el NIF. Inténtelo de nuevo.",
      };
    }
  });

export const registerOwner = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = asRecord(input);
    return {
      nif: asString(pick(body, "nif"), 32),
      password: asSecret(pick(body, "password"), 200),
      confirm: asSecret(pick(body, "confirm"), 200),
    };
  })
  .handler(async ({ data }) => {
    try {
      const { registerOwnerPassword } = await import("@/server/owners");
      return await registerOwnerPassword(data.nif, data.password, data.confirm);
    } catch (error) {
      return failure(error);
    }
  });

export const resendActivation = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ nif: asString(pick(asRecord(input), "nif"), 32) }))
  .handler(async ({ data }) => {
    try {
      const { resendActivation: resend } = await import("@/server/owners");
      return await resend(data.nif);
    } catch (error) {
      return failure(error);
    }
  });

export const loginOwner = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = asRecord(input);
    return {
      nif: asString(pick(body, "nif"), 32),
      password: asSecret(pick(body, "password"), 200),
    };
  })
  .handler(async ({ data }) => {
    try {
      const { loginOwner: login } = await import("@/server/owners");
      return await login(data.nif, data.password);
    } catch (error) {
      return failure(error);
    }
  });

export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ nif: asString(pick(asRecord(input), "nif"), 32) }))
  .handler(async ({ data }) => {
    try {
      const { requestPasswordReset: request } = await import("@/server/owners");
      return await request(data.nif);
    } catch (error) {
      return failure(error);
    }
  });

export const activateAccount = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ token: asString(pick(asRecord(input), "token"), 200) }))
  .handler(async ({ data }) => {
    try {
      const { activateAccount: activate } = await import("@/server/owners");
      return await activate(data.token);
    } catch (error) {
      return failure(error);
    }
  });

export const resetPassword = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = asRecord(input);
    return {
      token: asString(pick(body, "token"), 200),
      password: asSecret(pick(body, "password"), 200),
      confirm: asSecret(pick(body, "confirm"), 200),
    };
  })
  .handler(async ({ data }) => {
    try {
      const { resetPassword: reset } = await import("@/server/owners");
      return await reset(data.token, data.password, data.confirm);
    } catch (error) {
      return failure(error);
    }
  });

export const getOwnerAccount = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { currentOwner } = await import("@/server/owners");
    return await currentOwner();
  } catch (error) {
    console.error(error);
    return null;
  }
});

export const logoutOwner = createServerFn({ method: "POST" })
  .validator(() => ({}))
  .handler(async () => {
    const { logoutOwner: logout } = await import("@/server/owners");
    return logout();
  });

export const loginAdmin = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = asRecord(input);
    return {
      email: asString(pick(body, "email"), 200),
      password: asSecret(pick(body, "password"), 200),
    };
  })
  .handler(async ({ data }) => {
    try {
      const { loginAdmin: login } = await import("@/server/admins");
      return await login(data.email, data.password);
    } catch (error) {
      return failure(error);
    }
  });

export const logoutAdmin = createServerFn({ method: "POST" })
  .validator(() => ({}))
  .handler(async () => {
    const { logoutAdmin: logout } = await import("@/server/admins");
    return logout();
  });

export const getAdminDashboard = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { loadAdminDashboard } = await import("@/server/admins");
    return await loadAdminDashboard();
  } catch (error) {
    console.error(error);
    return null;
  }
});

export const createCommunity = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = asRecord(input);
    return {
      name: asString(pick(body, "name"), 120),
      address: asString(pick(body, "address"), 200),
    };
  })
  .handler(async ({ data }) => {
    try {
      const { createCommunity: create } = await import("@/server/admins");
      return await create(data.name, data.address);
    } catch (error) {
      return failure(error);
    }
  });

export const deleteCommunity = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ id: asString(pick(asRecord(input), "id"), 80) }))
  .handler(async ({ data }) => {
    try {
      const { deleteCommunity: remove } = await import("@/server/admins");
      return await remove(data.id);
    } catch (error) {
      return failure(error);
    }
  });

export const saveOwner = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = asRecord(input);
    const id = asString(pick(body, "id"), 80);
    return {
      id,
      nif: asString(pick(body, "nif"), 32),
      fullName: asString(pick(body, "fullName"), 120),
      email: asString(pick(body, "email"), 200),
      validate: pick(body, "validate") === true,
      units: pick(body, "units"),
    };
  })
  .handler(async ({ data }) => {
    try {
      const { saveOwner: save } = await import("@/server/admins");
      return await save({
        ...(data.id ? { id: data.id } : {}),
        nif: data.nif,
        fullName: data.fullName,
        email: data.email,
        validate: data.validate,
        units: data.units,
      });
    } catch (error) {
      return failure(error);
    }
  });

export const setOwnerValidation = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = asRecord(input);
    return { id: asString(pick(body, "id"), 80), validated: pick(body, "validated") === true };
  })
  .handler(async ({ data }) => {
    try {
      const { setOwnerValidation: setValidation } = await import("@/server/admins");
      return await setValidation(data.id, data.validated);
    } catch (error) {
      return failure(error);
    }
  });

export const deleteOwner = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ id: asString(pick(asRecord(input), "id"), 80) }))
  .handler(async ({ data }) => {
    try {
      const { removeOwner } = await import("@/server/admins");
      return await removeOwner(data.id);
    } catch (error) {
      return failure(error);
    }
  });
