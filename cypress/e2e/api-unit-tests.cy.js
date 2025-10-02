describe('Contact List API - Unit Tests', () => {
    const API_BASE_URL = 'https://thinking-tester-contact-list.herokuapp.com'

    // Test data generators
    const generateUniqueUser = () => ({
        firstName: 'Test',
        lastName: 'User',
        email: `test.user.${Date.now()}.${Math.random().toString(36).substring(7)}@example.com`,
        password: 'MySecurePassword123!'
    })

    const generateUniqueContact = () => ({
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '1990-05-15',
        email: `john.doe.${Date.now()}@example.com`,
        phone: '8005555555',
        street1: '123 Main St.',
        street2: 'Apartment A',
        city: 'Anytown',
        stateProvince: 'KS',
        postalCode: '12345',
        country: 'USA'
    })

    // Shared test data
    let authToken = ''
    let testUserId = ''
    let testContactId = ''

    describe('User Management API', () => {

        context('POST /users - User Registration', () => {
            it('should register a new user with valid data', () => {
                const newUser = generateUniqueUser()

                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/users`,
                    body: newUser
                }).then((response) => {
                    expect(response.status).to.eq(201)
                    expect(response.body).to.have.property('user')
                    expect(response.body).to.have.property('token')
                    expect(response.body.user).to.have.property('_id')
                    expect(response.body.user.firstName).to.eq(newUser.firstName)
                    expect(response.body.user.lastName).to.eq(newUser.lastName)
                    expect(response.body.user.email).to.eq(newUser.email)
                    expect(response.body.user).to.not.have.property('password')
                    expect(response.body.token).to.be.a('string').and.not.be.empty

                    // Store for cleanup
                    authToken = response.body.token
                    testUserId = response.body.user._id
                })
            })


            it('should return 400 when email format is invalid', () => {
                const invalidUser = generateUniqueUser()
                invalidUser.email = 'invalid-email-format'

                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/users`,
                    body: invalidUser,
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(400)
                    expect(response.body).to.have.property('message')
                })
            })

            it('should return 400 when email already exists', () => {
                const firstUser = generateUniqueUser()

                // Register first user
                cy.request('POST', `${API_BASE_URL}/users`, firstUser).then(() => {
                    // Try to register with same email
                    const duplicateUser = generateUniqueUser()
                    duplicateUser.email = firstUser.email

                    cy.request({
                        method: 'POST',
                        url: `${API_BASE_URL}/users`,
                        body: duplicateUser,
                        failOnStatusCode: false
                    }).then((response) => {
                        expect(response.status).to.eq(400)
                        expect(response.body).to.have.property('message')
                        expect(response.body.message).to.include('Email address is already in use')
                    })
                })
            })

            it('should return 400 when password is too short', () => {
                const invalidUser = generateUniqueUser()
                invalidUser.password = '123'

                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/users`,
                    body: invalidUser,
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(400)
                    expect(response.body).to.have.property('message')
                })
            })
        })

        context('POST /users/login - User Authentication', () => {
            let loginUser

            beforeEach(() => {
                loginUser = generateUniqueUser()
                // Create user for login tests
                cy.request('POST', `${API_BASE_URL}/users`, loginUser).then((response) => {
                    authToken = response.body.token
                })
            })

            it('should login with valid credentials', () => {
                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/users/login`,
                    body: {
                        email: loginUser.email,
                        password: loginUser.password
                    }
                }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body).to.have.property('user')
                    expect(response.body).to.have.property('token')
                    expect(response.body.user.email).to.eq(loginUser.email)
                    expect(response.body.token).to.be.a('string').and.not.be.empty
                })
            })

            it('should return 401 with invalid email', () => {
                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/users/login`,
                    body: {
                        email: 'nonexistent@example.com',
                        password: loginUser.password
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(401)
                })
            })

            it('should return 401 with invalid password', () => {
                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/users/login`,
                    body: {
                        email: loginUser.email,
                        password: 'wrongpassword'
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(401)
                })
            })

        })

        context('GET /users/me - Get User Profile', () => {
            let profileUser
            let userToken

            beforeEach(() => {
                profileUser = generateUniqueUser()
                cy.request('POST', `${API_BASE_URL}/users`, profileUser).then((response) => {
                    userToken = response.body.token
                })
            })

            it('should get user profile with valid token', () => {
                cy.request({
                    method: 'GET',
                    url: `${API_BASE_URL}/users/me`,
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body).to.have.property('_id')
                    expect(response.body.firstName).to.eq(profileUser.firstName)
                    expect(response.body.lastName).to.eq(profileUser.lastName)
                    expect(response.body.email).to.eq(profileUser.email)
                    expect(response.body).to.not.have.property('password')
                })
            })

            it('should return 401 without authorization header', () => {
                cy.request({
                    method: 'GET',
                    url: `${API_BASE_URL}/users/me`,
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(401)
                })
            })

            it('should return 401 with invalid token', () => {
                cy.request({
                    method: 'GET',
                    url: `${API_BASE_URL}/users/me`,
                    headers: {
                        'Authorization': 'Bearer invalid-token'
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(401)
                })
            })
        })

        context('PATCH /users/me - Update User Profile', () => {
            let updateUser
            let userToken

            beforeEach(() => {
                updateUser = generateUniqueUser()
                cy.request('POST', `${API_BASE_URL}/users`, updateUser).then((response) => {
                    userToken = response.body.token
                })
            })

            it('should update user firstName', () => {
                const updateData = { firstName: 'UpdatedFirstName' }

                cy.request({
                    method: 'PATCH',
                    url: `${API_BASE_URL}/users/me`,
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: updateData
                }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body.firstName).to.eq(updateData.firstName)
                    expect(response.body.lastName).to.eq(updateUser.lastName)
                    expect(response.body.email).to.eq(updateUser.email)
                })
            })

            it('should update user lastName', () => {
                const updateData = { lastName: 'UpdatedLastName' }

                cy.request({
                    method: 'PATCH',
                    url: `${API_BASE_URL}/users/me`,
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: updateData
                }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body.lastName).to.eq(updateData.lastName)
                })
            })

            it('should update multiple fields', () => {
                const updateData = {
                    firstName: 'NewFirst',
                    lastName: 'NewLast'
                }

                cy.request({
                    method: 'PATCH',
                    url: `${API_BASE_URL}/users/me`,
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: updateData
                }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body.firstName).to.eq(updateData.firstName)
                    expect(response.body.lastName).to.eq(updateData.lastName)
                })
            })

            it('should return 401 without authorization', () => {
                cy.request({
                    method: 'PATCH',
                    url: `${API_BASE_URL}/users/me`,
                    body: { firstName: 'Test' },
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(401)
                })
            })
        })

        context('POST /users/logout - User Logout', () => {
            let logoutUser
            let userToken

            beforeEach(() => {
                logoutUser = generateUniqueUser()
                cy.request('POST', `${API_BASE_URL}/users`, logoutUser).then((response) => {
                    userToken = response.body.token
                })
            })

            it('should logout successfully with valid token', () => {
                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/users/logout`,
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                }).then((response) => {
                    expect(response.status).to.eq(200)
                })
            })

            it('should return 401 without authorization', () => {
                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/users/logout`,
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(401)
                })
            })
        })

        context('DELETE /users/me - Delete User Account', () => {
            let deleteUser
            let userToken

            beforeEach(() => {
                deleteUser = generateUniqueUser()
                cy.request('POST', `${API_BASE_URL}/users`, deleteUser).then((response) => {
                    userToken = response.body.token
                })
            })

            it('should delete user account with valid token', () => {
                cy.request({
                    method: 'DELETE',
                    url: `${API_BASE_URL}/users/me`,
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                }).then((response) => {
                    expect(response.status).to.eq(200)
                })
            })

            it('should return 401 without authorization', () => {
                cy.request({
                    method: 'DELETE',
                    url: `${API_BASE_URL}/users/me`,
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(401)
                })
            })
        })
    })

    describe('Contact Management API', () => {
        let contactUser
        let contactToken

        beforeEach(() => {
            contactUser = generateUniqueUser()
            cy.request('POST', `${API_BASE_URL}/users`, contactUser).then((response) => {
                contactToken = response.body.token
            })
        })

        context('POST /contacts - Add Contact', () => {
            it('should create contact with all fields', () => {
                const newContact = generateUniqueContact()

                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/contacts`,
                    headers: {
                        'Authorization': `Bearer ${contactToken}`
                    },
                    body: newContact
                }).then((response) => {
                    expect(response.status).to.eq(201)
                    expect(response.body).to.have.property('_id')
                    expect(response.body.firstName).to.eq(newContact.firstName)
                    expect(response.body.lastName).to.eq(newContact.lastName)
                    expect(response.body.email).to.eq(newContact.email)
                    expect(response.body.phone).to.eq(newContact.phone)
                    expect(response.body.birthdate).to.eq(newContact.birthdate)
                    expect(response.body.street1).to.eq(newContact.street1)
                    expect(response.body.street2).to.eq(newContact.street2)
                    expect(response.body.city).to.eq(newContact.city)
                    expect(response.body.stateProvince).to.eq(newContact.stateProvince)
                    expect(response.body.postalCode).to.eq(newContact.postalCode)
                    expect(response.body.country).to.eq(newContact.country)
                    expect(response.body).to.have.property('owner')

                    testContactId = response.body._id
                })
            })

            it('should create contact with only required fields', () => {
                const minimalContact = {
                    firstName: 'Jane',
                    lastName: 'Smith'
                }

                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/contacts`,
                    headers: {
                        'Authorization': `Bearer ${contactToken}`
                    },
                    body: minimalContact
                }).then((response) => {
                    expect(response.status).to.eq(201)
                    expect(response.body.firstName).to.eq(minimalContact.firstName)
                    expect(response.body.lastName).to.eq(minimalContact.lastName)
                })
            })

            it('should return 400 when firstName is missing', () => {
                const invalidContact = generateUniqueContact()
                delete invalidContact.firstName

                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/contacts`,
                    headers: {
                        'Authorization': `Bearer ${contactToken}`
                    },
                    body: invalidContact,
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(400)
                })
            })

            it('should return 400 when lastName is missing', () => {
                const invalidContact = generateUniqueContact()
                delete invalidContact.lastName

                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/contacts`,
                    headers: {
                        'Authorization': `Bearer ${contactToken}`
                    },
                    body: invalidContact,
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(400)
                })
            })

            it('should return 401 without authorization', () => {
                const newContact = generateUniqueContact()

                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/contacts`,
                    body: newContact,
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(401)
                })
            })
        })

        context('GET /contacts - Get Contact List', () => {
            beforeEach(() => {
                // Create a test contact
                const contact = generateUniqueContact()
                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/contacts`,
                    headers: { 'Authorization': `Bearer ${contactToken}` },
                    body: contact
                }).then((response) => {
                    testContactId = response.body._id
                })
            })

            it('should get list of contacts', () => {
                cy.request({
                    method: 'GET',
                    url: `${API_BASE_URL}/contacts`,
                    headers: {
                        'Authorization': `Bearer ${contactToken}`
                    }
                }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body).to.be.an('array')
                    expect(response.body.length).to.be.greaterThan(0)
                    expect(response.body[0]).to.have.property('_id')
                    expect(response.body[0]).to.have.property('firstName')
                    expect(response.body[0]).to.have.property('lastName')
                })
            })

            it('should return 401 without authorization', () => {
                cy.request({
                    method: 'GET',
                    url: `${API_BASE_URL}/contacts`,
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(401)
                })
            })
        })

        context('GET /contacts/:id - Get Specific Contact', () => {
            beforeEach(() => {
                const contact = generateUniqueContact()
                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/contacts`,
                    headers: { 'Authorization': `Bearer ${contactToken}` },
                    body: contact
                }).then((response) => {
                    testContactId = response.body._id
                })
            })

            it('should get specific contact by ID', () => {
                cy.request({
                    method: 'GET',
                    url: `${API_BASE_URL}/contacts/${testContactId}`,
                    headers: {
                        'Authorization': `Bearer ${contactToken}`
                    }
                }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body).to.have.property('_id', testContactId)
                    expect(response.body).to.have.property('firstName')
                    expect(response.body).to.have.property('lastName')
                })
            })

            it('should return 404 for non-existent contact', () => {
                const fakeId = '507f1f77bcf86cd799439011'

                cy.request({
                    method: 'GET',
                    url: `${API_BASE_URL}/contacts/${fakeId}`,
                    headers: {
                        'Authorization': `Bearer ${contactToken}`
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(404)
                })
            })

            it('should return 401 without authorization', () => {
                cy.request({
                    method: 'GET',
                    url: `${API_BASE_URL}/contacts/${testContactId}`,
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(401)
                })
            })
        })

        context('PUT /contacts/:id - Update Contact', () => {
            beforeEach(() => {
                const contact = generateUniqueContact()
                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/contacts`,
                    headers: { 'Authorization': `Bearer ${contactToken}` },
                    body: contact
                }).then((response) => {
                    testContactId = response.body._id
                })
            })

            it('should update contact with valid data', () => {
                const updatedContact = {
                    firstName: 'UpdatedJohn',
                    lastName: 'UpdatedDoe',
                    email: 'updated.email@example.com',
                    phone: '9998887777'
                }

                cy.request({
                    method: 'PUT',
                    url: `${API_BASE_URL}/contacts/${testContactId}`,
                    headers: {
                        'Authorization': `Bearer ${contactToken}`
                    },
                    body: updatedContact
                }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body.firstName).to.eq(updatedContact.firstName)
                    expect(response.body.lastName).to.eq(updatedContact.lastName)
                    expect(response.body.email).to.eq(updatedContact.email)
                    expect(response.body.phone).to.eq(updatedContact.phone)
                })
            })

            it('should return 404 for non-existent contact', () => {
                const fakeId = '507f1f77bcf86cd799439011'
                const updateData = {
                    "firstName": "Amy",
                    "lastName": "Miller",
                    "birthdate": "1992-02-02",
                    "email": "amiller@fake.com",
                    "phone": "8005554242",
                    "street1": "13 School St.",
                    "street2": "Apt. 5",
                    "city": "Washington",
                    "stateProvince": "QC",
                    "postalCode": "A1A1A1",
                    "country": "Canada"
                }

                cy.request({
                    method: 'PUT',
                    url: `${API_BASE_URL}/contacts/${fakeId}`,
                    headers: {
                        'Authorization': `Bearer ${contactToken}`
                    },
                    body: updateData,
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(404)
                })
            })

            it('should return 401 without authorization', () => {
                const updateData = { firstName: 'Test' }

                cy.request({
                    method: 'PUT',
                    url: `${API_BASE_URL}/contacts/${testContactId}`,
                    body: updateData,
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(401)
                })
            })
        })

        context('DELETE /contacts/:id - Delete Contact', () => {
            beforeEach(() => {
                const contact = generateUniqueContact()
                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/contacts`,
                    headers: { 'Authorization': `Bearer ${contactToken}` },
                    body: contact
                }).then((response) => {
                    testContactId = response.body._id
                })
            })

            it('should delete contact successfully', () => {
                cy.request({
                    method: 'DELETE',
                    url: `${API_BASE_URL}/contacts/${testContactId}`,
                    headers: {
                        'Authorization': `Bearer ${contactToken}`
                    }
                }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body).to.contain('Contact deleted')
                })
            })

            it('should return 404 for non-existent contact', () => {
                const fakeId = '507f1f77bcf86cd799439011'

                cy.request({
                    method: 'DELETE',
                    url: `${API_BASE_URL}/contacts/${fakeId}`,
                    headers: {
                        'Authorization': `Bearer ${contactToken}`
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(404)
                })
            })

            it('should return 401 without authorization', () => {
                cy.request({
                    method: 'DELETE',
                    url: `${API_BASE_URL}/contacts/${testContactId}`,
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(401)
                })
            })
        })
    })

    describe('API Security and Error Handling', () => {
        context('Authentication and Authorization', () => {
            it('should protect all user endpoints', () => {
                const protectedEndpoints = [
                    { method: 'GET', url: '/users/me' },
                    { method: 'PATCH', url: '/users/me' },
                    { method: 'DELETE', url: '/users/me' },
                    { method: 'POST', url: '/users/logout' }
                ]

                protectedEndpoints.forEach(endpoint => {
                    cy.request({
                        method: endpoint.method,
                        url: `${API_BASE_URL}${endpoint.url}`,
                        failOnStatusCode: false
                    }).then((response) => {
                        expect(response.status).to.eq(401)
                    })
                })
            })

            it('should protect all contact endpoints', () => {
                const protectedEndpoints = [
                    { method: 'GET', url: '/contacts' },
                    { method: 'POST', url: '/contacts' },
                    { method: 'GET', url: '/contacts/123' },
                    { method: 'PUT', url: '/contacts/123' },
                    { method: 'DELETE', url: '/contacts/123' }
                ]

                protectedEndpoints.forEach(endpoint => {
                    cy.request({
                        method: endpoint.method,
                        url: `${API_BASE_URL}${endpoint.url}`,
                        failOnStatusCode: false
                    }).then((response) => {
                        expect(response.status).to.eq(401)
                    })
                })
            })
        })

        context('Input Validation', () => {
            let validToken

            before(() => {
                const user = generateUniqueUser()
                cy.request('POST', `${API_BASE_URL}/users`, user).then((response) => {
                    validToken = response.body.token
                })
            })

            it('should validate email format in user registration', () => {
                const invalidEmails = [
                    'invalid-email',
                    '@example.com',
                    'test@',
                    'test..test@example.com',
                    ''
                ]

                invalidEmails.forEach(email => {
                    const user = generateUniqueUser()
                    user.email = email

                    cy.request({
                        method: 'POST',
                        url: `${API_BASE_URL}/users`,
                        body: user,
                        failOnStatusCode: false
                    }).then((response) => {
                        expect(response.status).to.eq(400)
                    })
                })
            })

            it('should validate required fields in contact creation', () => {
                const requiredFields = ['firstName', 'lastName']

                requiredFields.forEach(field => {
                    const invalidContact = generateUniqueContact()
                    delete invalidContact[field]

                    cy.request({
                        method: 'POST',
                        url: `${API_BASE_URL}/contacts`,
                        headers: { 'Authorization': `Bearer ${validToken}` },
                        body: invalidContact,
                        failOnStatusCode: false
                    }).then((response) => {
                        expect(response.status).to.eq(400)
                    })
                })
            })
        })

    })

    describe('API Performance and Limits', () => {
        context('Response Times', () => {
            let performanceToken

            before(() => {
                const user = generateUniqueUser()
                cy.request('POST', `${API_BASE_URL}/users`, user).then((response) => {
                    performanceToken = response.body.token
                })
            })

            it('should respond to user registration within reasonable time', () => {
                const start = Date.now()
                const user = generateUniqueUser()

                cy.request('POST', `${API_BASE_URL}/users`, user).then(() => {
                    const duration = Date.now() - start
                    expect(duration).to.be.lessThan(5000) // 5 seconds max
                })
            })

            it('should respond to contact list within reasonable time', () => {
                const start = Date.now()

                cy.request({
                    method: 'GET',
                    url: `${API_BASE_URL}/contacts`,
                    headers: { 'Authorization': `Bearer ${performanceToken}` }
                }).then(() => {
                    const duration = Date.now() - start
                    expect(duration).to.be.lessThan(3000) // 3 seconds max
                })
            })
        })

        context('Data Integrity', () => {
            let integrityToken

            before(() => {
                const user = generateUniqueUser()
                cy.request('POST', `${API_BASE_URL}/users`, user).then((response) => {
                    integrityToken = response.body.token
                })
            })

            it('should maintain data consistency when creating and retrieving contacts', () => {
                const contact = generateUniqueContact()

                cy.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/contacts`,
                    headers: { 'Authorization': `Bearer ${integrityToken}` },
                    body: contact
                }).then((createResponse) => {
                    const contactId = createResponse.body._id

                    cy.request({
                        method: 'GET',
                        url: `${API_BASE_URL}/contacts/${contactId}`,
                        headers: { 'Authorization': `Bearer ${integrityToken}` }
                    }).then((getResponse) => {
                        expect(getResponse.body.firstName).to.eq(contact.firstName)
                        expect(getResponse.body.lastName).to.eq(contact.lastName)
                        expect(getResponse.body.email).to.eq(contact.email)
                        expect(getResponse.body.phone).to.eq(contact.phone)
                    })
                })
            })
        })
    })
})