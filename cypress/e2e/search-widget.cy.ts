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
})