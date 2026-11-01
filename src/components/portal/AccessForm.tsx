import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { passwordRules } from "@/lib/portal/password";
import {
  loginOwner,
  lookupOwner,
  registerOwner,
  requestPasswordReset,
  resendActivation,
} from "@/lib/portal/api";
import {
  fieldClass,
  FormNote,
  Field,
  primaryButtonClass,
  quietButtonClass,
} from "@/components/portal/ui";

type Phase = "identify" | "create" | "login" | "pending" | "forgot";

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date(iso));
}

export function AccessForm() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("identify");
  const [nif, setNif] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [devMail, setDevMail] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lookupGen = useRef(0);

  function resetMessages() {
    setError("");
    setNotice("");
  }

  function openForgot() {
    lookupGen.current += 1;
    resetMessages();
    setBusy(false);
    setPhase("forgot");
  }

  function backToNif() {
    setPhase("identify");
    setPassword("");
    setConfirm("");
    resetMessages();
  }

  async function onLookup(event: FormEvent) {
    event.preventDefault();
    resetMessages();
    setBusy(true);
    const gen = ++lookupGen.current;
    try {
      const result = await lookupOwner({ data: { nif } });
      if (gen !== lookupGen.current) return;
      if (result.status === "invalid") {
        setError(result.error);
        return;
      }
      if (result.status === "unknown") {
        setError(
          "Este NIF o NIE no consta en los registros de Fincas Verco. Si es propietario de una vivienda, un local o una plaza de garaje, contacte con la administración para que validen su alta.",
        );
        return;
      }
      if (result.status === "not_validated") {
        setError(
          "Su NIF o NIE está en los registros, pero un administrador todavía no ha validado el acceso.",
        );
        return;
      }
      if (result.status === "locked") {
        setError(
          `El acceso está bloqueado hasta ${formatWhen(result.lockedUntil)} por varios intentos fallidos.`,
        );
        return;
      }
      setMaskedEmail(result.maskedEmail);
      if (result.status === "needs_password") setPhase("create");
      if (result.status === "needs_activation") setPhase("pending");
      if (result.status === "ready") setPhase("login");
    } catch {
      if (gen === lookupGen.current)
        setError("No se ha podido comprobar el NIF. Inténtelo de nuevo.");
    } finally {
      if (gen === lookupGen.current) setBusy(false);
    }
  }

  async function onRegister(event: FormEvent) {
    event.preventDefault();
    resetMessages();
    setBusy(true);
    try {
      const result = await registerOwner({ data: { nif, password, confirm } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMaskedEmail(result.data.maskedEmail);
      setDevMail(result.data.devMail);
      setPassword("");
      setConfirm("");
      setPhase("pending");
      setNotice(`Le hemos enviado un correo de activación a ${result.data.maskedEmail}.`);
    } catch {
      setError("No se ha podido crear la cuenta. Inténtelo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  async function onResend() {
    resetMessages();
    setBusy(true);
    try {
      const result = await resendActivation({ data: { nif } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDevMail(result.data.devMail);
      setNotice(`Le hemos enviado de nuevo el correo de activación a ${result.data.maskedEmail}.`);
    } catch {
      setError("No se ha podido reenviar el correo.");
    } finally {
      setBusy(false);
    }
  }

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    resetMessages();
    setBusy(true);
    try {
      const result = await loginOwner({ data: { nif, password } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await navigate({ to: "/portal/cuenta" });
    } catch {
      setError("No se ha podido entrar. Inténtelo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  async function onForgot(event: FormEvent) {
    event.preventDefault();
    resetMessages();
    setBusy(true);
    try {
      const result = await requestPasswordReset({ data: { nif } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDevMail(result.data.devMail);
      setMaskedEmail(result.data.maskedEmail);
      setNotice(
        `Le hemos enviado un correo a ${result.data.maskedEmail}. Revise también la carpeta de spam.`,
      );
    } catch {
      setError("No se ha podido enviar el correo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {phase === "identify" ? (
        <form onSubmit={onLookup} className="space-y-4">
          <Field id="nif" label="NIF o NIE">
            <input
              id="nif"
              name="username"
              autoComplete="username"
              autoCapitalize="characters"
              spellCheck={false}
              required
              value={nif}
              onChange={(event) => setNif(event.target.value)}
              placeholder="12345678Z"
              className={fieldClass}
            />
          </Field>
          {error ? <FormNote tone="error">{error}</FormNote> : null}
          <button type="submit" disabled={busy} className={primaryButtonClass}>
            {busy ? "Comprobando…" : "Continuar"}
          </button>
          <button type="button" className={`${quietButtonClass} w-full`} onClick={openForgot}>
            He olvidado mi contraseña
          </button>
        </form>
      ) : null}

      {phase === "create" ? (
        <form onSubmit={onRegister} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Su NIF está validado. Elija una contraseña. La enviaremos para activar la cuenta a{" "}
            {maskedEmail}.
          </p>
          <PasswordFields
            password={password}
            confirm={confirm}
            onPassword={setPassword}
            onConfirm={setConfirm}
          />
          {error ? <FormNote tone="error">{error}</FormNote> : null}
          <button type="submit" disabled={busy} className={primaryButtonClass}>
            {busy ? "Guardando…" : "Crear contraseña y enviar activación"}
          </button>
          <button type="button" onClick={backToNif} className={`${quietButtonClass} w-full`}>
            Usar otro NIF
          </button>
        </form>
      ) : null}

      {phase === "login" ? (
        <form onSubmit={onLogin} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Entre con la contraseña de {nif.toUpperCase()}.
          </p>
          <Field id="password" label="Contraseña">
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={fieldClass}
            />
          </Field>
          {error ? <FormNote tone="error">{error}</FormNote> : null}
          <button type="submit" disabled={busy} className={primaryButtonClass}>
            {busy ? "Entrando…" : "Entrar"}
          </button>
          <button type="button" onClick={openForgot} className={`${quietButtonClass} w-full`}>
            He olvidado mi contraseña
          </button>
          <button type="button" onClick={backToNif} className={`${quietButtonClass} w-full`}>
            Usar otro NIF
          </button>
        </form>
      ) : null}

      {phase === "pending" ? (
        <div className="space-y-4">
          <FormNote tone="ok">
            {notice || `Active la cuenta desde el correo enviado a ${maskedEmail}.`}
          </FormNote>
          <p className="text-sm text-muted-foreground">
            El enlace caduca en 48 horas. Hasta que lo abra no podrá entrar.
          </p>
          {devMail ? <DevMailNote /> : null}
          {error ? <FormNote tone="error">{error}</FormNote> : null}
          <button type="button" disabled={busy} onClick={onResend} className={primaryButtonClass}>
            {busy ? "Enviando…" : "Reenviar correo de activación"}
          </button>
          <button type="button" onClick={openForgot} className={`${quietButtonClass} w-full`}>
            He olvidado la contraseña
          </button>
          <button type="button" onClick={backToNif} className={`${quietButtonClass} w-full`}>
            Usar otro NIF
          </button>
        </div>
      ) : null}

      {phase === "forgot" ? (
        <form onSubmit={onForgot} className="space-y-4">
          <Field id="nif-reset" label="NIF o NIE">
            <input
              id="nif-reset"
              autoComplete="username"
              autoCapitalize="characters"
              spellCheck={false}
              required
              value={nif}
              onChange={(event) => setNif(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <p className="text-sm text-muted-foreground">
            Si la cuenta ya está activada, recibirá un enlace para elegir una contraseña nueva. Si
            aún no la ha activado, le reenviaremos el correo de activación.
          </p>
          {notice ? <FormNote tone="ok">{notice}</FormNote> : null}
          {devMail && notice ? <DevMailNote /> : null}
          {error ? <FormNote tone="error">{error}</FormNote> : null}
          <button type="submit" disabled={busy} className={primaryButtonClass}>
            {busy ? "Enviando…" : "Enviar enlace"}
          </button>
          <button type="button" onClick={backToNif} className={`${quietButtonClass} w-full`}>
            Volver al acceso
          </button>
          <p className="text-center text-sm">
            <Link to="/contacto" className="font-medium text-primary hover:underline">
              Contactar con la administración
            </Link>
          </p>
        </form>
      ) : null}
    </div>
  );
}

function DevMailNote() {
  return (
    <p className="rounded-xl bg-amber-500/15 px-3 py-2 text-sm text-amber-950">
      En este servidor local el correo no sale a internet. El enlace está en la terminal del
      servidor y en la carpeta .data/outbox.
    </p>
  );
}

function PasswordFields({
  password,
  confirm,
  onPassword,
  onConfirm,
}: {
  password: string;
  confirm: string;
  onPassword: (value: string) => void;
  onConfirm: (value: string) => void;
}) {
  const rules = passwordRules(password);
  return (
    <>
      <Field id="new-password" label="Contraseña">
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => onPassword(event.target.value)}
          className={fieldClass}
        />
      </Field>
      <ul className="grid gap-1 text-sm sm:grid-cols-2">
        {rules.map((rule) => (
          <li key={rule.id} className={rule.ok ? "text-emerald-800" : "text-muted-foreground"}>
            {rule.ok ? "✓" : "○"} {rule.label}
          </li>
        ))}
      </ul>
      <Field id="confirm-password" label="Repita la contraseña">
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => onConfirm(event.target.value)}
          className={fieldClass}
        />
      </Field>
    </>
  );
}

export { PasswordFields };
