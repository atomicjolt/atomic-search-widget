describe('Search Widget', () => {
  before(() => {
    cy.login();
    cy.openFirstCourse()
  })

  it('shows search page when the user types and submit', () => {
    /**
     * Type and click search button
     */
    cy.findSearchWidget().within(() => {
      cy.findByPlaceholderText(/Search this course/i).type("test");
      cy.findByLabelText(/submit search/i).click();
    })

    cy.iframe('#tool_content').findByLabelText(/search bar/i).should('have.value', 'test')

    /**
     * Type and press enter
     */
    cy.findSearchWidget().within(() => {
      cy.findByPlaceholderText(/Search this course/i).type("{selectall}example{enter}");
    })

    cy.iframe('#tool_content').findByLabelText(/search bar/i).should('have.value', 'example')
  })

  it('shows discussion replies when the user searches in discussions page', () => {
    cy.findByLabelText(/Courses Navigation Menu/i).findByRole('link', { name: /Discussions/i }).click();

    cy.findSearchWidget().within(() => {
      cy.findByPlaceholderText(/Search this course/i).type("test");
      cy.findByLabelText(/submit search/i).click();
    })

    cy.iframe('#tool_content').findByRole('button', { name: /Discussion Replies/i }).should('exist')
  })
})