import { useState, type FormEvent } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { UNIT_LABELS, UNIT_TYPES, type UnitType } from "@/lib/portal/identity";
import type { AdminDashboard, OwnerAdminRow } from "@/lib/portal/types";
import {
  createCommunity,
  deleteCommunity,
  deleteOwner,
  logoutAdmin,
  saveOwner,
  setOwnerValidation,
} from "@/lib/portal/api";
import {
  fieldClass,
  FormNote,
  Field,
  primaryButtonClass,
  quietButtonClass,
} from "@/components/portal/ui";

type DraftUnit = {
  key: string;
  communityId: string;
  unitType: UnitType;
  unitLabel: string;
};

function blankUnit(communityId = ""): DraftUnit {
  return { key: crypto.randomUUID(), communityId, unitType: "vivienda", unitLabel: "" };
}

function statusOf(owner: OwnerAdminRow): { label: string; tone: string } {
  if (!owner.validated) return { label: "Sin validar", tone: "bg-ink/10 text-foreground" };
  if (owner.locked) return { label: "Bloqueado", tone: "bg-red-600/15 text-red-800" };
  if (!owner.hasPassword)
    return { label: "Sin contraseña", tone: "bg-amber-500/15 text-amber-950" };
  if (!owner.activated)
    return { label: "Pendiente de activación", tone: "bg-amber-500/15 text-amber-950" };
  return { label: "Activo", tone: "bg-emerald-600/15 text-emerald-900" };
}

export function AdminPanel({ dashboard }: { dashboard: AdminDashboard }) {
  const router = useRouter();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nif, setNif] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [validateNow, setValidateNow] = useState(true);
  const [units, setUnits] = useState<DraftUnit[]>([blankUnit()]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    await router.invalidate();
  }

  function clearOwnerForm() {
    setEditingId(null);
    setNif("");
    setFullName("");
    setEmail("");
    setValidateNow(true);
    setUnits([blankUnit(dashboard.communities[0]?.id ?? "")]);
  }

  function editOwner(owner: OwnerAdminRow) {
    setEditingId(owner.id);
    setNif(owner.nif);
    setFullName(owner.fullName);
    setEmail(owner.email);
    setValidateNow(owner.validated);
    setUnits(
      owner.units.length > 0
        ? owner.units.map((unit) => ({
            key: unit.id,
            communityId: unit.communityId,
            unitType: unit.unitType,
            unitLabel: unit.unitLabel,
          }))
        : [blankUnit()],
    );
    setError("");
    setNotice("");
  }

  async function onCommunity(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await createCommunity({ data: { name, address } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setName("");
      setAddress("");
      setNotice(`Comunidad «${result.data.name}» creada.`);
      await refresh();
    } catch {
      setError("No se ha podido crear la comunidad.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteCommunity(id: string, communityName: string) {
    if (!window.confirm(`¿Eliminar la comunidad «${communityName}»?`)) return;
    setBusy(true);
    setError("");
    try {
      const result = await deleteCommunity({ data: { id } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await refresh();
    } catch {
      setError("No se ha podido eliminar la comunidad.");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveOwner(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await saveOwner({
        data: {
          id: editingId ?? "",
          nif,
          fullName,
          email,
          validate: validateNow,
          units: units.map((unit) => ({
            communityId: unit.communityId,
            unitType: unit.unitType,
            unitLabel: unit.unitLabel,
          })),
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotice(editingId ? "Propietario actualizado." : "Propietario dado de alta.");
      clearOwnerForm();
      await refresh();
    } catch {
      setError("No se ha podido guardar el propietario.");
    } finally {
      setBusy(false);
    }
  }

  async function onValidate(owner: OwnerAdminRow, validated: boolean) {
    setBusy(true);
    setError("");
    try {
      const result = await setOwnerValidation({ data: { id: owner.id, validated } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotice(
        validated
          ? `${owner.fullName} queda validado.`
          : `Se ha retirado la validación de ${owner.fullName}.`,
      );
      await refresh();
    } catch {
      setError("No se ha podido cambiar la validación.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteOwner(owner: OwnerAdminRow) {
    if (!window.confirm(`¿Eliminar a ${owner.fullName} (${owner.nif})?`)) return;
    setBusy(true);
    setError("");
    try {
      const result = await deleteOwner({ data: { id: owner.id } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (editingId === owner.id) clearOwnerForm();
      await refresh();
    } catch {
      setError("No se ha podido eliminar el propietario.");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await logoutAdmin({ data: {} });
    await navigate({ to: "/admin" });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <section className="space-y-4">
        <h2 className="font-display text-2xl">Comunidades</h2>
        <form onSubmit={onCommunity} className="space-y-3">
          <Field id="community-name" label="Nombre">
            <input
              id="community-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field id="community-address" label="Dirección">
            <input
              id="community-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <button type="submit" disabled={busy} className={primaryButtonClass}>
            Añadir comunidad
          </button>
        </form>
        <ul className="space-y-2">
          {dashboard.communities.length === 0 ? (
            <li className="text-sm text-muted-foreground">Todavía no hay comunidades.</li>
          ) : (
            dashboard.communities.map((community) => (
              <li
                key={community.id}
                className="rounded-xl bg-white/50 px-3 py-3 text-sm ring-1 ring-border"
              >
                <div className="font-medium">{community.name}</div>
                {community.address ? (
                  <div className="text-muted-foreground">{community.address}</div>
                ) : null}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDeleteCommunity(community.id, community.name)}
                  className="mt-2 text-xs font-semibold text-red-700"
                >
                  Eliminar
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Propietarios</h2>
          <button type="button" onClick={onLogout} className={quietButtonClass}>
            Cerrar sesión
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Solo un NIF o NIE validado aquí puede crear contraseña. Sirve para vivienda, local
          comercial y plaza de garaje, también si tiene varios.
        </p>
        {notice ? <FormNote tone="ok">{notice}</FormNote> : null}
        {error ? <FormNote tone="error">{error}</FormNote> : null}

        <form
          onSubmit={onSaveOwner}
          className="space-y-4 rounded-2xl bg-white/40 p-4 ring-1 ring-border"
        >
          <h3 className="font-semibold">
            {editingId ? "Editar propietario" : "Alta de propietario"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="owner-nif" label="NIF o NIE">
              <input
                id="owner-nif"
                required
                value={nif}
                onChange={(event) => setNif(event.target.value)}
                autoCapitalize="characters"
                spellCheck={false}
                className={fieldClass}
              />
            </Field>
            <Field id="owner-name" label="Nombre completo">
              <input
                id="owner-name"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>
          <Field id="owner-email" label="Correo para activar la cuenta">
            <input
              id="owner-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <div className="space-y-3">
            {units.map((unit, index) => (
              <div key={unit.key} className="grid gap-2 sm:grid-cols-[1fr_180px_1fr_auto]">
                <select
                  aria-label={`Comunidad del inmueble ${index + 1}`}
                  value={unit.communityId}
                  onChange={(event) =>
                    setUnits((current) =>
                      current.map((item) =>
                        item.key === unit.key ? { ...item, communityId: event.target.value } : item,
                      ),
                    )
                  }
                  className={fieldClass}
                >
                  <option value="">Comunidad</option>
                  {dashboard.communities.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={`Tipo del inmueble ${index + 1}`}
                  value={unit.unitType}
                  onChange={(event) =>
                    setUnits((current) =>
                      current.map((item) =>
                        item.key === unit.key
                          ? { ...item, unitType: event.target.value as UnitType }
                          : item,
                      ),
                    )
                  }
                  className={fieldClass}
                >
                  {UNIT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {UNIT_LABELS[type]}
                    </option>
                  ))}
                </select>
                <input
                  aria-label={`Identificación del inmueble ${index + 1}`}
                  value={unit.unitLabel}
                  onChange={(event) =>
                    setUnits((current) =>
                      current.map((item) =>
                        item.key === unit.key ? { ...item, unitLabel: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="3º B, Local 2, Plaza 14…"
                  className={fieldClass}
                />
                <button
                  type="button"
                  className={quietButtonClass}
                  disabled={units.length === 1}
                  onClick={() =>
                    setUnits((current) => current.filter((item) => item.key !== unit.key))
                  }
                >
                  Quitar
                </button>
              </div>
            ))}
            <button
              type="button"
              className={quietButtonClass}
              onClick={() => setUnits((current) => [...current, blankUnit()])}
            >
              Añadir inmueble
            </button>
          </div>
          {!editingId ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={validateNow}
                onChange={(event) => setValidateNow(event.target.checked)}
              />
              Validar el acceso ahora
            </label>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy || dashboard.communities.length === 0}
              className={`${primaryButtonClass} sm:w-auto`}
            >
              {editingId ? "Guardar cambios" : "Dar de alta"}
            </button>
            {editingId ? (
              <button type="button" onClick={clearOwnerForm} className={quietButtonClass}>
                Cancelar edición
              </button>
            ) : null}
          </div>
          {dashboard.communities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Cree antes una comunidad.</p>
          ) : null}
        </form>

        <ul className="space-y-3">
          {dashboard.owners.length === 0 ? (
            <li className="text-sm text-muted-foreground">Todavía no hay propietarios.</li>
          ) : (
            dashboard.owners.map((owner) => {
              const status = statusOf(owner);
              return (
                <li key={owner.id} className="rounded-2xl bg-white/50 p-4 ring-1 ring-border">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{owner.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {owner.nif} · {owner.email}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.tone}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm">
                    {owner.units.map((unit) => (
                      <li key={unit.id}>
                        {UNIT_LABELS[unit.unitType]} · {unit.unitLabel}
                        <span className="text-muted-foreground"> — {unit.communityName}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => editOwner(owner)}
                      className={quietButtonClass}
                    >
                      Editar
                    </button>
                    {owner.validated ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onValidate(owner, false)}
                        className={quietButtonClass}
                      >
                        Retirar validación
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onValidate(owner, true)}
                        className={quietButtonClass}
                      >
                        Validar
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onDeleteOwner(owner)}
                      className={quietButtonClass}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </div>
  );
}
