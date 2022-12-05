/// <reference types="cypress" />
import '@testing-library/cypress/add-commands'
import 'cypress-iframe';

declare global {
    namespace Cypress {
        interface Chainable {
            login(email?: string, password?: string): Chainable<void>
            logout(): Chainable<void>
            openFirstCourse(): Chainable<void>
            findSearchWidget(): Chainable<JQuery<HTMLElement>>
        }
    }
}

Cypress.Commands.add('login', (email = Cypress.env("email"), password = Cypress.env("password")) => {
    cy.visit(`${Cypress.env("canvasUrl")}/login/canvas`)

    cy.get("#login_form").within(() => {
        cy.findByLabelText(/Email/i).type(email);
        cy.findByLabelText(/Password/i).type(password);

        cy.findByRole("button", { name: /Log In/i }).click();
    })
})

Cypress.Commands.add('logout', () => {
    cy.findByLabelText("Global Navigation").within(() => {
        cy.findByRole('button', { name: /Account/i }).click();
    })

    cy.findByRole('button', { name: /Logout/i }).click();
})

Cypress.Commands.add('openFirstCourse', () => {
    cy.intercept('GET', '**/courses**').as('getCourses');

    cy.findByLabelText("Global Navigation").within(() => {
        cy.findByRole('button', { name: /Courses/i }).click();
    })

    cy.wait('@getCourses').then(({ response }) => {
        const courses = response.body;
        if (!courses.length) {
            throw new Error('Testing account should have at least one course.')
        }

        const firstCourseName = courses[0].name

        cy.findByRole('link', { name: firstCourseName }).click();
    })
})

Cypress.Commands.add('findSearchWidget', () => cy.get('atomic-search-desktop-widget').shadow())