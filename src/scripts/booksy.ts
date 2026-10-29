import { CONTACT } from "../lib/data";

function dialog(): HTMLDialogElement {
  const existing = document.querySelector<HTMLDialogElement>("#reserva");
  if (existing) return existing;

  const element = document.createElement("dialog");
  element.id = "reserva";
  element.className = "booksy-dialog";
  element.innerHTML = `
    <div class="booksy-dialog-bar">
      <p>Reservar cita</p>
      <button type="button" class="btn" data-booksy-close>Cerrar</button>
    </div>
    <iframe title="Calendario de reservas de Booksy"></iframe>
  `;
  document.body.appendChild(element);
  element.querySelector("[data-booksy-close]")?.addEventListener("click", () => element.close());
  element.addEventListener("click", (event) => {
    if (event.target === element) element.close();
  });
  return element;
}

function openCalendar() {
  const element = dialog();
  const frame = element.querySelector("iframe");
  if (frame && !frame.getAttribute("src")) frame.setAttribute("src", CONTACT.booksyWidget);
  element.showModal();
}

document.querySelectorAll<HTMLAnchorElement>("a[data-booksy]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    openCalendar();
  });
});
