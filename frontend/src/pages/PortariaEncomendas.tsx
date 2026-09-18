import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../hooks/useAuth";
import { isPortariaEmail } from "../services/portaria";
import { supabase } from "../services/supabase";
export type DeliveryStatus = "RECEBIDA" | "NOTIFICADA" | "ENTREGUE";
type Delivery = {
  id: number;
  recipient_name: string;
  apartment: string;
  block: string;
  carrier: string | null;
  received_by: string;
  received_at: string;
  status: DeliveryStatus;
  notes: string | null;
};
type FormState = {
  recipient_name: string;
  apartment: string;
  block: string;
  carrier: string;
  received_by: string;
  received_time: string;
  notes: string;
};
const porterNames = ["Cláudio", "José", "Fábio", "Leandro", "Rafael"];
const apartments = [
  "101",
  "102",
  "103",
  "104",
  "201",
  "202",
  "203",
  "204",
  "301",
  "302",
  "303",
  "304",
  "401",
  "402",
  "403",
  "404",
  "501",
  "502",
  "503",
  "504",
  "601",
  "602",
  "603",
  "604",
  "701",
  "702",
  "703",
  "704",
];
const labels: Record<DeliveryStatus, string> = {
  RECEBIDA: "Recebida",
  NOTIFICADA: "Morador notificado",
  ENTREGUE: "Entregue",
};
function createForm(): FormState {
  const now = new Date();
  return {
    recipient_name: "",
    apartment: "",
    block: "",
    carrier: "",
    received_by: "",
    received_time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    notes: "",
  };
}
function toDate(time: string) {
  const date = new Date();
  const [hour, minute] = time.split(":").map(Number);
  date.setHours(
    Number.isFinite(hour) ? hour : 0,
    Number.isFinite(minute) ? minute : 0,
    0,
    0,
  );
  return date.toISOString();
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
function currentTimeValue() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}
export default function PortariaEncomendas() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [isPortaria, setIsPortaria] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [form, setForm] = useState<FormState>(createForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"TODAS" | DeliveryStatus>(
    "TODAS",
  );
  const [month, setMonth] = useState("TODOS");
  const [year, setYear] = useState("TODOS");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Delivery | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    delivery: Delivery;
    status: "NOTIFICADA" | "ENTREGUE";
  } | null>(null);
  const [timeOpen, setTimeOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const pageSize = 10;
  useEffect(() => {
    if (!session?.user.id) return;
    const allowed = isPortariaEmail(session.user.email);
    setIsPortaria(allowed);
    supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        setIsAdmin(data?.role === "ADMIN");
        if (allowed) loadDeliveries();
        else setLoading(false);
      });
  }, [session?.user.id]);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, month, year]);
  async function loadDeliveries() {
    const { data, error: queryError } = await supabase
      .from("package_deliveries")
      .select(
        "id, recipient_name, apartment, block, carrier, received_by, received_at, status, notes",
      )
      .order("received_at", { ascending: false });
    if (queryError) setError(queryError.message);
    setDeliveries((data as Delivery[]) || []);
    setLoading(false);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!session?.user.id) return;
    if (
      !form.recipient_name.trim() ||
      !form.apartment ||
      !form.block ||
      !form.received_by
    ) {
      setError("Preencha destinatário, apartamento, bloco e recebido por.");
      return;
    }
    if (!form.received_time) {
      setError("Informe o horário de recebimento.");
      return;
    }
    setSaving(true);
    const { data, error: insertError } = await supabase
      .from("package_deliveries")
      .insert({
        recipient_name: form.recipient_name.trim(),
        apartment: form.apartment,
        block: form.block,
        carrier: form.carrier.trim() || null,
        received_by: form.received_by,
        received_at: toDate(form.received_time),
        notes: form.notes.trim() || null,
        created_by: session.user.id,
      })
      .select(
        "id, recipient_name, apartment, block, carrier, received_by, received_at, status, notes",
      )
      .single();
    if (insertError) setError(insertError.message);
    else {
      setDeliveries((current) => [data as Delivery, ...current]);
      setForm(createForm());
      setSuccess("Encomenda registrada com sucesso.");
    }
    setSaving(false);
  }
  async function updateStatus(delivery: Delivery, status: DeliveryStatus) {
    setActionId(delivery.id);
    const { error: updateError } = await supabase
      .from("package_deliveries")
      .update({ status })
      .eq("id", delivery.id);
    if (updateError) setError(updateError.message);
    else
      setDeliveries((current) =>
        current.map((item) =>
          item.id === delivery.id ? { ...item, status } : item,
        ),
      );
    setActionId(null);
  }
  async function deleteDelivery(delivery: Delivery) {
    setActionId(delivery.id);
    const { error: deleteError } = await supabase
      .from("package_deliveries")
      .delete()
      .eq("id", delivery.id);
    if (deleteError) setError(deleteError.message);
    else {
      setDeliveries((current) =>
        current.filter((item) => item.id !== delivery.id),
      );
      setSuccess("Encomenda excluída com sucesso.");
    }
    setActionId(null);
    setPendingDelete(null);
  }
  const baseFiltered = useMemo(
    () =>
      deliveries
        .filter((item) => {
        const date = new Date(item.received_at);
        const text = search.trim().toLowerCase();
        return (
          (month === "TODOS" || String(date.getMonth() + 1) === month) &&
          (year === "TODOS" || String(date.getFullYear()) === year) &&
          (!text ||
            [
              item.recipient_name,
              item.apartment,
              item.block,
              item.carrier || "",
              item.received_by,
            ].some((value) => value.toLowerCase().includes(text)))
        );
        })
        .sort(
          (left, right) =>
            new Date(right.received_at).getTime() -
            new Date(left.received_at).getTime(),
        ),
    [deliveries, search, month, year],
  );
  const filtered =
    statusFilter === "TODAS"
      ? baseFiltered
      : baseFiltered.filter((item) => item.status === statusFilter);
  const years = Array.from(
    new Set(
      deliveries.map((item) =>
        String(new Date(item.received_at).getFullYear()),
      ),
    ),
  )
    .sort()
    .reverse();
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const counts = {
    RECEBIDA: baseFiltered.filter((item) => item.status === "RECEBIDA").length,
    NOTIFICADA: baseFiltered.filter((item) => item.status === "NOTIFICADA")
      .length,
    ENTREGUE: baseFiltered.filter((item) => item.status === "ENTREGUE").length,
  };
  async function logoutUser() {
    await logout();
    navigate("/login");
  }
  const toggleStatus = (status: DeliveryStatus) =>
    setStatusFilter((current) => (current === status ? "TODAS" : status));
  if (!isPortaria)
    return (
      <div className="site-root">
        <Header />
        <main className="dashboard-shell container">
          <Link className="dashboard-back-link" to="/portaria">
            ← Voltar para a Portaria
          </Link>
          <h1>Acesso restrito</h1>
          <p>
            Esta área está disponível somente para usuários autorizados da
            portaria.
          </p>
        </main>
        <Footer />
      </div>
    );
  return (
    <div className="site-root">
      <Header />
      <main className="delivery-page container">
        <div className="dashboard-header">
          <div>
            <Link className="dashboard-back-link" to="/portaria">
              ← Voltar para a Portaria
            </Link>
            <span className="dashboard-kicker">Portaria</span>
            <h1>Registro de encomendas</h1>
            <p>Registre a chegada, avise o morador e acompanhe a retirada.</p>
          </div>
          <button
            className="dashboard-logout"
            type="button"
            onClick={logoutUser}
          >
            Sair
          </button>
        </div>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
        {isAdmin && (
          <section className="delivery-form-card">
            <div className="section-heading">
              <div>
                <span className="section-label">Nova entrada</span>
                <h2>Registrar encomenda</h2>
              </div>
            </div>
            <form onSubmit={submit}>
              <div className="delivery-form-grid">
                <div>
                  <label>Destinatário</label>
                  <input
                    value={form.recipient_name}
                    onChange={(e) =>
                      setForm({ ...form, recipient_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label>Transportadora</label>
                  <input
                    value={form.carrier}
                    onChange={(e) =>
                      setForm({ ...form, carrier: e.target.value })
                    }
                    placeholder="Correios, iFood..."
                  />
                </div>
                <div>
                  <label>Apartamento</label>
                  <select
                    value={form.apartment}
                    onChange={(e) =>
                      setForm({ ...form, apartment: e.target.value })
                    }
                    required
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    {apartments.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Bloco</label>
                  <select
                    value={form.block}
                    onChange={(e) =>
                      setForm({ ...form, block: e.target.value })
                    }
                    required
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option>Bloco A</option>
                    <option>Bloco B</option>
                  </select>
                </div>
                <div>
                  <label>Recebido por</label>
                  <select
                    value={form.received_by}
                    onChange={(e) =>
                      setForm({ ...form, received_by: e.target.value })
                    }
                    required
                  >
                    <option value="" disabled>
                      Selecione o porteiro
                    </option>
                    {porterNames.map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="delivery-time-field">
                  <label>Horário de recebimento</label>
                  <div className="delivery-time-control">
                    <button className="time-picker-trigger" type="button" onClick={() => setTimeOpen((open) => !open)} aria-expanded={timeOpen} aria-haspopup="dialog">
                      <span className="time-picker-clock" aria-hidden="true">◷</span>{form.received_time || "00:00"}
                    </button>
                    <button className="current-time-button" type="button" onClick={() => setForm({ ...form, received_time: currentTimeValue() })}><span aria-hidden="true">◷</span> Agora</button>
                  </div>
                  {timeOpen && <div className="time-picker-popover" role="dialog" aria-label="Escolher horário"><div><label htmlFor="delivery-hour">Hora</label><select id="delivery-hour" value={form.received_time.split(":")[0]} onChange={(e) => setForm({ ...form, received_time: `${e.target.value}:${form.received_time.split(":")[1] || "00"}` })}>{Array.from({ length: 24 }, (_, hour) => <option key={hour} value={String(hour).padStart(2, "0")}>{String(hour).padStart(2, "0")}</option>)}</select></div><span className="time-picker-colon" aria-hidden="true">:</span><div><label htmlFor="delivery-minute">Minuto</label><select id="delivery-minute" value={form.received_time.split(":")[1] || "00"} onChange={(e) => setForm({ ...form, received_time: `${form.received_time.split(":")[0] || "00"}:${e.target.value}` })}>{Array.from({ length: 60 }, (_, minute) => <option key={minute} value={String(minute).padStart(2, "0")}>{String(minute).padStart(2, "0")}</option>)}</select></div><button className="time-picker-done" type="button" onClick={() => setTimeOpen(false)}>Aplicar horário</button></div>}
                  <input className="sr-only" value={form.received_time} required readOnly aria-label="Horário de recebimento selecionado" />
                  <span className="field-help">Escolha a hora e o minuto</span>
                </div>
                <div className="delivery-notes-field">
                  <label>Observações</label>
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                  />
                </div>
              </div>
              <button type="submit" disabled={saving}>
                {saving ? "Registrando..." : "Registrar encomenda"}
              </button>
            </form>
          </section>
        )}
        <section className="delivery-list-section">
          <div className="section-heading">
            <div>
              <span className="section-label">Livro da portaria</span>
              <h2>Encomendas registradas</h2>
            </div>
            <span className="section-count">{filtered.length} registros</span>
          </div>
          <section className="delivery-stats">
            <button
              type="button"
              className={`delivery-stat-button${statusFilter === "TODAS" ? " is-active" : ""}`}
              onClick={() => setStatusFilter("TODAS")}
            >
              <strong>{baseFiltered.length}</strong>
              <span>Tudo</span>
            </button>
            <button
              type="button"
              className={`delivery-stat-button${statusFilter === "RECEBIDA" ? " is-active" : ""}`}
              onClick={() => toggleStatus("RECEBIDA")}
            >
              <strong>{counts.RECEBIDA}</strong>
              <span>Recebidas</span>
            </button>
            <button
              type="button"
              className={`delivery-stat-button${statusFilter === "NOTIFICADA" ? " is-active" : ""}`}
              onClick={() => toggleStatus("NOTIFICADA")}
            >
              <strong>{counts.NOTIFICADA}</strong>
              <span>Notificadas</span>
            </button>
            <button
              type="button"
              className={`delivery-stat-button${statusFilter === "ENTREGUE" ? " is-active" : ""}`}
              onClick={() => toggleStatus("ENTREGUE")}
            >
              <strong>{counts.ENTREGUE}</strong>
              <span>Entregues</span>
            </button>
          </section>
          <div className="delivery-toolbar">
            <input
              aria-label="Buscar encomenda"
              placeholder="Buscar por morador, apartamento, transportadora ou porteiro"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="TODOS">Todos os meses</option>
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {new Date(2024, index).toLocaleString("pt-BR", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="TODOS">Todos os anos</option>
              {years.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
            >
              <option value="TODAS">Todos os status</option>
              <option value="RECEBIDA">Recebidas</option>
              <option value="NOTIFICADA">Notificadas</option>
              <option value="ENTREGUE">Entregues</option>
            </select>
          </div>
          {loading && (
            <div className="dashboard-loading">Carregando encomendas...</div>
          )}
          {!loading && visible.length === 0 && (
            <div className="dashboard-empty">
              <strong>Nenhuma encomenda encontrada.</strong>
              <span>Altere os filtros para consultar outros registros.</span>
            </div>
          )}
          <div className="delivery-list">
            {visible.map((item) => (
              <article className="delivery-item" key={item.id}>
                <div className="delivery-item-main">
                  <div>
                    <span
                      className={`delivery-status delivery-status-${item.status.toLowerCase()}`}
                    >
                      {labels[item.status]}
                    </span>
                    <h3>{item.recipient_name}</h3>
                    <p>
                      Apartamento {item.apartment} · {item.block}
                    </p>
                  </div>
                  <time>{formatDate(item.received_at)}</time>
                </div>
                <div className="delivery-meta">
                  <span>{item.carrier || "Transportadora não informada"}</span>
                  <span>Recebido por: {item.received_by}</span>
                  {item.notes && <span>{item.notes}</span>}
                </div>
                {isAdmin && (
                  <div className="delivery-actions">
                    <button
                      type="button"
                      onClick={() =>
                        setPendingAction({
                          delivery: item,
                          status: "NOTIFICADA",
                        })
                      }
                      disabled={
                        actionId === item.id || item.status === "NOTIFICADA"
                      }
                    >
                      Notificar
                    </button>
                    <button
                      type="button"
                      className="delivery-complete-button"
                      onClick={() =>
                        setPendingAction({ delivery: item, status: "ENTREGUE" })
                      }
                      disabled={
                        actionId === item.id || item.status === "ENTREGUE"
                      }
                    >
                      Entregue
                    </button>
                    <button
                      type="button"
                      className="delivery-delete"
                      onClick={() => setPendingDelete(item)}
                      disabled={actionId === item.id}
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
          {pageCount > 1 && (
            <div className="delivery-pagination">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
              >
                Anterior
              </button>
              <div className="delivery-page-numbers" aria-label="Páginas de encomendas">
                {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      className={pageNumber === page ? 'is-active' : ''}
                      onClick={() => setPage(pageNumber)}
                      aria-label={`Ir para a página ${pageNumber}`}
                      aria-current={pageNumber === page ? 'page' : undefined}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
              </div>
              <span>
                Página {page} de {pageCount}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(pageCount, current + 1))
                }
                disabled={page === pageCount}
              >
                Próxima
              </button>
            </div>
          )}
        </section>
      </main>
      <Footer />
      {pendingDelete && (
        <div
          className="delete-dialog-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPendingDelete(null);
          }}
        >
          <section
            className="delete-dialog"
            role="alertdialog"
            aria-modal="true"
          >
            <div className="delete-dialog-icon">!</div>
            <h2>Excluir encomenda?</h2>
            <p>
              Tem certeza que deseja excluir a encomenda de{" "}
              <strong>{pendingDelete.recipient_name}</strong>? Esta ação é
              permanente.
            </p>
            <div className="delete-dialog-actions">
              <button
                type="button"
                className="delete-dialog-cancel"
                onClick={() => setPendingDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="delete-dialog-confirm"
                onClick={() => deleteDelivery(pendingDelete)}
                disabled={actionId === pendingDelete.id}
              >
                {actionId === pendingDelete.id
                  ? "Excluindo..."
                  : "Sim, excluir"}
              </button>
            </div>
          </section>
        </div>
      )}
      {pendingAction && (
        <div
          className="delete-dialog-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPendingAction(null);
          }}
        >
          <section
            className="delete-dialog delivery-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
          >
            <div
              className={
                pendingAction.status === "NOTIFICADA"
                  ? "notification-confirm-icon"
                  : "delivery-confirm-icon"
              }
            >
              {pendingAction.status === "NOTIFICADA" ? "!" : "✓"}
            </div>
            <h2>
              {pendingAction.status === "NOTIFICADA"
                ? "Confirmar notificação?"
                : "Confirmar entrega?"}
            </h2>
            <p>
              Confirme que o morador{" "}
              <strong>{pendingAction.delivery.recipient_name}</strong>,
              apartamento <strong>{pendingAction.delivery.apartment}</strong> -{" "}
              {pendingAction.delivery.block},{" "}
              {pendingAction.status === "NOTIFICADA"
                ? "foi notificado sobre a encomenda."
                : "recebeu a encomenda."}
            </p>
            <div className="delete-dialog-actions">
              <button
                type="button"
                className="delete-dialog-cancel"
                onClick={() => setPendingAction(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="delivery-confirm-button"
                onClick={() => {
                  updateStatus(pendingAction.delivery, pendingAction.status);
                  setPendingAction(null);
                }}
              >
                Confirmar
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
