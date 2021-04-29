import { restore, modal } from "__support__/cypress";
import { PG_DB_NAME } from "__support__/cypress_data";

describe("postgres > question > native", () => {
  beforeEach(() => {
    restore("postgres");
    cy.signInAsAdmin();
  });

  it.skip("should save a question before query has been executed (metabase#14957)", () => {
    cy.visit("/question/new");
    cy.findByText("Native query").click();
    cy.findByText(PG_DB_NAME).click();
    cy.get(".ace_content").type("select pg_sleep(60)");
    cy.findByText("Save").click();
    cy.findByLabelText("Name").type("14957");
    cy.findByRole("button", { name: "Save" }).click();
    modal().should("not.exist");
  });
});
