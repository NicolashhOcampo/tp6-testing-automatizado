describe('Contact List App - Contact Management', () => {
    const testUser = {
        firstName: 'ContactTest',
        lastName: 'User',
        email: `contact.test.${Date.now()}@example.com`,
        password: 'myPassword123!'
    }

    const testContact = {
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '1990-01-15',
        email: 'john.doe@example.com',
        phone: '8005555555',
        street1: '1 Main St.',
        street2: 'Apartment A',
        city: 'Anytown',
        stateProvince: 'KS',
        postalCode: '12345',
        country: 'USA'
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
        cy.visit('/login')
        cy.get('#email').type(testUser.email)
        cy.get('#password').type(testUser.password)
        cy.get('#submit').click()
        cy.url().should('include', '/contactList')
    })

    afterEach(() => {
        // Clean up: delete any contacts created during tests
        cy.get('body').then($body => {
            if ($body.find('.contactTableBodyRow').length > 0) {
                cy.get('.contactTableBodyRow').each(() => {
                    cy.get('.contactTableBodyRow').first().click()
                    cy.get('#delete').click()
                    cy.get('#return').click()
                })
            }
        })
    })

    context('Contact List Page', () => {
        it('should display the contact list page after login', () => {
            cy.contains('Contact List').should('be.visible')
            cy.contains('Add a New Contact').should('be.visible')
            cy.get('#add-contact').should('be.visible')
            cy.get('#logout').should('be.visible')
        })

        it('should show empty contact list initially', () => {
            cy.contains('Contact List').should('be.visible')
            cy.get('.contactTable').should('be.visible')
            // Initially should have no contact rows
            cy.get('.contactTableBodyRow').should('not.exist')
        })

        it('should navigate to add contact page', () => {
            cy.get('#add-contact').click()
            cy.url().should('include', '/addContact')
            cy.contains('Add Contact').should('be.visible')
        })

        it('should logout successfully', () => {
            cy.get('#logout').click()
            cy.url().should('eq', Cypress.config().baseUrl + '/')
            cy.contains('Log In:').should('be.visible')
        })
    })

    context('Add Contact', () => {
        beforeEach(() => {
            cy.get('#add-contact').click()
        })

        it('should display the add contact form', () => {
            cy.contains('Add Contact').should('be.visible')
            cy.get('#firstName').should('be.visible')
            cy.get('#lastName').should('be.visible')
            cy.get('#birthdate').should('be.visible')
            cy.get('#email').should('be.visible')
            cy.get('#phone').should('be.visible')
            cy.get('#street1').should('be.visible')
            cy.get('#street2').should('be.visible')
            cy.get('#city').should('be.visible')
            cy.get('#stateProvince').should('be.visible')
            cy.get('#postalCode').should('be.visible')
            cy.get('#country').should('be.visible')
            cy.get('#submit').should('be.visible')
            cy.get('#cancel').should('be.visible')
        })

        it('should add a contact with all fields', () => {
            cy.get('#firstName').type(testContact.firstName)
            cy.get('#lastName').type(testContact.lastName)
            cy.get('#birthdate').type(testContact.birthdate)
            cy.get('#email').type(testContact.email)
            cy.get('#phone').type(testContact.phone)
            cy.get('#street1').type(testContact.street1)
            cy.get('#street2').type(testContact.street2)
            cy.get('#city').type(testContact.city)
            cy.get('#stateProvince').type(testContact.stateProvince)
            cy.get('#postalCode').type(testContact.postalCode)
            cy.get('#country').type(testContact.country)
            cy.get('#submit').click()

            // Should return to contact list
            cy.url().should('include', '/contactList')
            cy.contains(`${testContact.firstName} ${testContact.lastName}`).should('be.visible')
        })

        it('should add a contact with only required fields', () => {
            cy.get('#firstName').type('Jane')
            cy.get('#lastName').type('Smith')
            cy.get('#submit').click()

            // Should return to contact list
            cy.url().should('include', '/contactList')
            cy.contains('Jane Smith').should('be.visible')
        })

        it('should validate required fields', () => {
            cy.get('#submit').click()

            // Should stay on add contact page if required fields are missing
            cy.url().should('include', '/addContact')
        })

        it('should cancel adding contact', () => {
            cy.get('#firstName').type('Test')
            cy.get('#lastName').type('Cancel')
            cy.get('#cancel').click()

            cy.url().should('include', '/contactList')
            cy.contains('Test Cancel').should('not.exist')
        })
    })

    context('View and Edit Contact', () => {
        beforeEach(() => {
            // Add a contact to work with
            cy.get('#add-contact').click()
            cy.get('#firstName').type(testContact.firstName)
            cy.get('#lastName').type(testContact.lastName)
            cy.get('#email').type(testContact.email)
            cy.get('#phone').type(testContact.phone)
            cy.get('#submit').click()
        })

        it('should view contact details', () => {
            cy.contains(`${testContact.firstName} ${testContact.lastName}`).click()

            cy.contains('Contact Details').should('be.visible')
            cy.contains(testContact.firstName).should('be.visible')
            cy.contains(testContact.lastName).should('be.visible')
            cy.contains(testContact.email).should('be.visible')
            cy.contains(testContact.phone).should('be.visible')
            cy.get('#edit-contact').should('be.visible')
            cy.get('#delete').should('be.visible')
            cy.get('#return').should('be.visible')
        })

        it('should edit contact', () => {
            cy.contains(`${testContact.firstName} ${testContact.lastName}`).click()
            cy.get('#edit-contact').click()

            cy.url().should('include', '/editContact')
            cy.contains('Edit Contact').should('be.visible')

            // Update the contact
            cy.get('#firstName').clear().type('UpdatedJohn')
            cy.get('#email').clear().type('updated.john@example.com')
            cy.get('#submit').click()

            // Should return to contact details
            cy.contains('Contact Details').should('be.visible')
            cy.contains('UpdatedJohn').should('be.visible')
            cy.contains('updated.john@example.com').should('be.visible')
        })

        it('should delete contact', () => {
            cy.contains(`${testContact.firstName} ${testContact.lastName}`).click()
            cy.get('#delete').click()

            // Should return to contact list
            cy.url().should('include', '/contactList')
            cy.contains(`${testContact.firstName} ${testContact.lastName}`).should('not.exist')
        })

        it('should return to contact list from contact details', () => {
            cy.contains(`${testContact.firstName} ${testContact.lastName}`).click()
            cy.get('#return').click()

            cy.url().should('include', '/contactList')
            cy.contains('Contact List').should('be.visible')
        })
    })
})