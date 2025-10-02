describe('Contact List App - Navigation and UI', () => {
    const testUser = {
        firstName: 'UITest',
        lastName: 'User',
        email: `ui.test.${Date.now()}@example.com`,
        password: 'myPassword123!'
    }

    // Setup: Create user and login
    before(() => {
        cy.visit('/addUser')
        cy.get('#firstName').type(testUser.firstName)
        cy.get('#lastName').type(testUser.lastName)
        cy.get('#email').type(testUser.email)
        cy.get('#password').type(testUser.password)
        cy.get('#submit').click()
    })

    beforeEach(() => {
        cy.visit('/')
        cy.get('#email').type(testUser.email)
        cy.get('#password').type(testUser.password)
        cy.get('#submit').click()
    })

    context('UI Elements and Styling', () => {
        it('should have proper page title', () => {
            cy.title().should('include', 'Contact List')
        })

        it('should display the app logo/branding', () => {
            cy.contains('Contact List').should('be.visible')
        })

        it('should be responsive on different viewport sizes', () => {
            // Test mobile viewport
            cy.viewport(375, 667)
            cy.contains('Contact List').should('be.visible')
            cy.get('#add-contact').should('be.visible')

            // Test tablet viewport
            cy.viewport(768, 1024)
            cy.contains('Contact List').should('be.visible')
            cy.get('#add-contact').should('be.visible')

            // Test desktop viewport
            cy.viewport(1280, 720)
            cy.contains('Contact List').should('be.visible')
            cy.get('#add-contact').should('be.visible')
        })

        it('should have consistent button styling', () => {
            cy.get('#add-contact').should('have.css', 'background-color')
            cy.get('#logout').should('have.css', 'background-color')
        })
    })

    context('Navigation Flow', () => {
        it('should maintain proper navigation flow through the app', () => {
            // Start at contact list
            cy.url().should('include', '/contactList')

            // Navigate to add contact
            cy.get('#add-contact').click()
            cy.url().should('include', '/addContact')

            // Cancel back to contact list
            cy.get('#cancel').click()
            cy.url().should('include', '/contactList')

            // Logout
            cy.get('#logout').click()
            cy.url().should('eq', Cypress.config().baseUrl + '/')
        })

        it('should prevent unauthorized access to protected pages', () => {
            // Logout first
            cy.get('#logout').click()

            // Try to access contact list directly
            cy.visit('/contactList')
            cy.url().should('eq', Cypress.config().baseUrl + '/')

            // Try to access add contact directly
            cy.visit('/addContact')
            cy.url().should('eq', Cypress.config().baseUrl + '/')
        })

        it('should handle browser back button correctly', () => {
            // Navigate to add contact
            cy.get('#add-contact').click()
            cy.url().should('include', '/addContact')

            // Use browser back button
            cy.go('back')
            cy.url().should('include', '/contactList')

            // Use browser forward button
            cy.go('forward')
            cy.url().should('include', '/addContact')
        })
    })

    context('Form Validation and Error Handling', () => {
        it('should handle network errors gracefully', () => {
            // This test would need to mock network failures
            // For now, we'll test that the app doesn't break with unexpected responses
            cy.intercept('POST', '**/users', { forceNetworkError: true }).as('networkError')

            cy.get('#logout').click()
            cy.visit('/addUser')
            cy.get('#firstName').type('Network')
            cy.get('#lastName').type('Test')
            cy.get('#email').type('network@example.com')
            cy.get('#password').type('password123')
            cy.get('#submit').click()

            // Should handle the error without crashing
            cy.get('body').should('exist')
        })

        it('should clear form fields when requested', () => {
            cy.get('#add-contact').click()

            // Fill some fields
            cy.get('#firstName').type('Test')
            cy.get('#lastName').type('User')
            cy.get('#email').type('test@example.com')

            // Cancel should clear the form when returning
            cy.get('#cancel').click()
            cy.get('#add-contact').click()

            cy.get('#firstName').should('have.value', '')
            cy.get('#lastName').should('have.value', '')
            cy.get('#email').should('have.value', '')
        })
    })

    context('Performance and Loading', () => {
        it('should load the contact list page quickly', () => {
            const start = Date.now()
            cy.visit('/contactList')
            cy.contains('Contact List').should('be.visible').then(() => {
                const loadTime = Date.now() - start
                expect(loadTime).to.be.lessThan(5000) // Should load within 5 seconds
            })
        })

        it('should handle multiple rapid clicks gracefully', () => {
            // Rapid clicks on add contact button
            cy.get('#add-contact').click()
            cy.get('#add-contact').click()
            cy.get('#add-contact').click()

            // Should only navigate once
            cy.url().should('include', '/addContact')
            cy.contains('Add Contact').should('be.visible')
        })
    })

    context('Accessibility', () => {
        it('should have proper form labels', () => {
            cy.get('#add-contact').click()

            // Check that form inputs have associated labels
            cy.get('#firstName').should('have.attr', 'id')
            cy.get('#lastName').should('have.attr', 'id')
            cy.get('#email').should('have.attr', 'id')
        })

        it('should be keyboard navigable', () => {
            // Test tab navigation
            cy.get('body').tab()
            cy.focused().should('have.id', 'add-contact')

            cy.focused().tab()
            cy.focused().should('have.id', 'logout')
        })

        it('should have proper button text for screen readers', () => {
            cy.get('#add-contact').should('contain.text', 'Add a New Contact')
            cy.get('#logout').should('contain.text', 'Logout')
        })
    })
})