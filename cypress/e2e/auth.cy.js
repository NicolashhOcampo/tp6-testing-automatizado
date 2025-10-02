describe('Contact List App - Login and Registration', () => {
    const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: `test.user.${Date.now()}@example.com`,
        password: 'myPassword123!'
    }

    beforeEach(() => {
        cy.visit('/')
    })

    context('Homepage', () => {
        it('should display the login form', () => {
            cy.contains('Contact List App').should('be.visible')
            cy.contains('Log In:').should('be.visible')
            cy.get('#email').should('be.visible')
            cy.get('#password').should('be.visible')
            cy.get('#submit').should('be.visible')
        })

        it('should have a link to sign up', () => {
            cy.contains('Not yet a user? Click here to sign up!').should('be.visible')
            cy.get('#signup').should('be.visible').and('contain', 'Sign up')
        })

        it('should navigate to signup page when clicking sign up link', () => {
            cy.get('#signup').click()
            cy.url().should('include', '/addUser')
            cy.contains('Add User').should('be.visible')
        })
    })

    context('User Registration', () => {
        beforeEach(() => {
            cy.visit('/addUser')
        })

        it('should display the registration form', () => {
            cy.contains('Add User').should('be.visible')
            cy.get('#firstName').should('be.visible')
            cy.get('#lastName').should('be.visible')
            cy.get('#email').should('be.visible')
            cy.get('#password').should('be.visible')
            cy.get('#submit').should('be.visible')
        })

        it('should register a new user successfully', () => {
            cy.get('#firstName').type(testUser.firstName)
            cy.get('#lastName').type(testUser.lastName)
            cy.get('#email').type(testUser.email)
            cy.get('#password').type(testUser.password)
            cy.get('#submit').click()

            // Should redirect to contact list page after successful registration
            cy.url().should('include', '/contactList')
            cy.contains('Contact List').should('be.visible')
            cy.contains('Add a New Contact').should('be.visible')
        })

        it('should show error when trying to register with existing email', () => {
            const duplicateEmail = `duplicate.test.${Date.now()}@example.com`

            // First registration
            cy.get('#firstName').type(testUser.firstName)
            cy.get('#lastName').type(testUser.lastName)
            cy.get('#email').type(duplicateEmail)
            cy.get('#password').type(testUser.password)
            cy.get('#submit').click()

            // Logout if registration was successful
            cy.get('body').then($body => {
                if ($body.find('#logout').length > 0) {
                    cy.get('#logout').click()
                }
            })

            // Try to register again with same email
            cy.visit('/addUser')
            cy.get('#firstName').type('Another')
            cy.get('#lastName').type('User')
            cy.get('#email').type(duplicateEmail)
            cy.get('#password').type('anotherPassword')
            cy.get('#submit').click()

            cy.get('#error').should('be.visible').and('contain', 'Email address is already in use')
        })

        it('should validate required fields', () => {
            cy.get('#submit').click()

            // Check that form doesn't submit without required fields
            cy.url().should('include', '/addUser')
        })

        it('should have a cancel/return button', () => {
            cy.get('#cancel').should('be.visible').and('contain', 'Cancel')
            cy.get('#cancel').click()
            cy.url().should('include', '/login')
        })
    })

    context('User Login', () => {
        // Create a unique user for login tests
        const loginUser = {
            firstName: 'Login',
            lastName: 'TestUser',
            email: `login.test.${Date.now()}@example.com`,
            password: 'LoginPassword123!'
        }

        // First create a user to test login
        before(() => {
            cy.visit('/addUser')
            cy.get('#firstName').type(loginUser.firstName)
            cy.get('#lastName').type(loginUser.lastName)
            cy.get('#email').type(loginUser.email)
            cy.get('#password').type(loginUser.password)
            cy.get('#submit').click()

            // Verify successful registration by checking we're on contact list page
            cy.url().should('include', '/contactList')
            cy.get('#logout').should('be.visible').click()
        })

        beforeEach(() => {
            cy.visit('/')
        })

        it('should login with valid credentials', () => {
            cy.get('#email').type(loginUser.email)
            cy.get('#password').type(loginUser.password)
            cy.get('#submit').click()

            cy.url().should('include', '/contactList')
            cy.contains('Contact List').should('be.visible')
            cy.get('#logout').should('be.visible')
        })

        it('should show error with invalid credentials', () => {
            cy.get('#email').type('invalid@example.com')
            cy.get('#password').type('wrongpassword')
            cy.get('#submit').click()

            cy.get('#error').should('be.visible').and('contain', 'Incorrect username or password')
            cy.url().should('eq', Cypress.config().baseUrl + '/')
        })

        it('should show error with empty credentials', () => {
            cy.get('#submit').click()

            // Should stay on login page
            cy.url().should('eq', Cypress.config().baseUrl + '/')
        })
    })
})