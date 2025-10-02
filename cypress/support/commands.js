// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom commands for Contact List App
Cypress.Commands.add('login', (email, password) => {
    cy.visit('/login')
    cy.get('[data-test="email"]').type(email)
    cy.get('[data-test="password"]').type(password)
    cy.get('[data-test="submit"]').click()
})

Cypress.Commands.add('register', (firstName, lastName, email, password) => {
    cy.visit('/addUser')
    cy.get('[data-test="firstName"]').type(firstName)
    cy.get('[data-test="lastName"]').type(lastName)
    cy.get('[data-test="email"]').type(email)
    cy.get('[data-test="password"]').type(password)
    cy.get('[data-test="submit"]').click()
})

Cypress.Commands.add('addContact', (firstName, lastName, birthdate, email, phone, street1, street2, city, stateProvince, postalCode, country) => {
    cy.get('[data-test="add-contact"]').click()
    cy.get('[data-test="firstName"]').type(firstName)
    cy.get('[data-test="lastName"]').type(lastName)
    if (birthdate) cy.get('[data-test="birthdate"]').type(birthdate)
    if (email) cy.get('[data-test="email"]').type(email)
    if (phone) cy.get('[data-test="phone"]').type(phone)
    if (street1) cy.get('[data-test="street1"]').type(street1)
    if (street2) cy.get('[data-test="street2"]').type(street2)
    if (city) cy.get('[data-test="city"]').type(city)
    if (stateProvince) cy.get('[data-test="stateProvince"]').type(stateProvince)
    if (postalCode) cy.get('[data-test="postalCode"]').type(postalCode)
    if (country) cy.get('[data-test="country"]').type(country)
    cy.get('[data-test="submit"]').click()
})

// Command to clear all contacts (useful for cleanup)
Cypress.Commands.add('clearAllContacts', () => {
    cy.get('body').then($body => {
        if ($body.find('[data-test="contact"]').length > 0) {
            cy.get('[data-test="contact"]').each(() => {
                cy.get('[data-test="contact"]').first().click()
                cy.get('[data-test="delete"]').click()
                cy.get('[data-test="return"]').click()
            })
        }
    })
})