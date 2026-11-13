import { expect, type Page, test } from "@playwright/test";

const enabledButton = (page: Page, name: string) =>
  page.locator("button:not([disabled]):visible", { hasText: new RegExp(`^${name}$`) }).first();

const hand = (page: Page) => page.locator("section[aria-labelledby=hand-title]");

async function openTableAgainstTheBot(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByLabel("Tu apodo").fill("Prueba CI");
  await page.getByRole("radio", { name: /^Clásica/ }).check({ force: true });
  await page.getByRole("button", { name: "Crear mesa", exact: true }).click();
  await page.waitForURL(/\/sala\/\?codigo=/);
  await page.getByRole("button", { name: "Agregar bot", exact: true }).click();
  await expect(page.getByText("Máquina 1").first()).toBeVisible();
  await page.getByRole("button", { name: "Iniciar partida", exact: true }).click();
  await page.waitForURL(/\/mesa\/\?codigo=/);
  await expect(hand(page)).toBeVisible();
}

async function drawFromDeck(page: Page): Promise<void> {
  await enabledButton(page, "Robar del mazo").waitFor({ timeout: 30_000 });
  await enabledButton(page, "Robar del mazo").click();
  await enabledButton(page, "Declarar cierre").waitFor();
}

async function discardLastCard(page: Page): Promise<void> {
  const cards = hand(page).locator("[data-hand-index]");
  const before = await cards.count();
  await cards.last().click();
  await enabledButton(page, "Descartar").click();
  await expect(cards).toHaveCount(before - 1);
  await expect(enabledButton(page, "Declarar cierre")).toHaveCount(0);
}

async function submitInvalidClosure(page: Page): Promise<string> {
  await enabledButton(page, "Declarar cierre").click();
  const dialog = page.locator("dialog[open]");
  const unassigned = dialog.getByRole("region", { name: "Cartas sin asignar" }).locator("[data-closure-card]");
  const moveTo = (slot: string) => dialog.getByRole("button", { name: `Mover las cartas seleccionadas a ${slot}` });
  await unassigned.first().click();
  await moveTo("Descarte").click();
  for (const card of await unassigned.all()) await card.click();
  await moveTo("Combinación 1").click();
  await expect(unassigned).toHaveCount(0);
  await dialog.getByRole("button", { name: "Enviar cierre" }).click();
  const alert = dialog.locator("[role=alert]");
  await expect(alert).toBeVisible();
  const reason = (await alert.textContent()) ?? "";
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  return reason;
}

test("un invitado juega turnos completos contra la máquina y el servidor rechaza un cierre inválido", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await openTableAgainstTheBot(page);

  await drawFromDeck(page);
  await discardLastCard(page);

  await drawFromDeck(page);
  const reason = await submitInvalidClosure(page);
  expect(reason.trim().length).toBeGreaterThan(0);
  await discardLastCard(page);

  await enabledButton(page, "Robar del mazo").waitFor({ timeout: 30_000 });
  expect(errors).toEqual([]);
});
