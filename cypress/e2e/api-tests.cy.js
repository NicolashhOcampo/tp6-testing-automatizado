describe('Contact List App - API Tests', () => {
    const apiUrl = 'https://thinking-tester-contact-list.herokuapp.com'

    let authToken = ''
    let userId = ''
    let contactId = ''

    const testUser = {
        firstName: 'API',
        lastName: 'Tester',
        email: `api.test.${Date.now()}@example.com`,
        password: 'ApiPassword123!'
    }

    const testContact = {
        firstName: 'API',
        lastName: 'Contact',
        email: 'api.contact@example.com',
        phone: '5551234567'
    }

    context('User API', () => {
        it('should register a new user via API', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/users`,
                body: testUser
            }).then((response) => {
                expect(response.status).to.eq(201)
                expect(response.body).to.have.property('user')
                expect(response.body).to.have.property('token')
                expect(response.body.user.firstName).to.eq(testUser.firstName)
                expect(response.body.user.lastName).to.eq(testUser.lastName)
                expect(response.body.user.email).to.eq(testUser.email)

                authToken = response.body.token
                userId = response.body.user._id
            })
        })

        it('should login user via API', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/users/login`,
                body: {
                    email: testUser.email,
                    password: testUser.password
                }
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body).to.have.property('user')
                expect(response.body).to.have.property('token')
                expect(response.body.user.email).to.eq(testUser.email)

                authToken = response.body.token
            })
        })

        it('should get user profile via API', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/users/me`,
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body.firstName).to.eq(testUser.firstName)
                expect(response.body.lastName).to.eq(testUser.lastName)
                expect(response.body.email).to.eq(testUser.email)
            })
        })

        it('should update user profile via API', () => {
            const updatedData = {
                firstName: 'Updated API',
                lastName: 'Updated Tester'
            }

            cy.request({
                method: 'PATCH',
                url: `${apiUrl}/users/me`,
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: updatedData
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body.firstName).to.eq(updatedData.firstName)
                expect(response.body.lastName).to.eq(updatedData.lastName)
            })
        })

        it('should handle unauthorized requests', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/users/me`,
                headers: {
                    'Authorization': 'Bearer invalid-token'
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401)
            })
        })

        it('should handle duplicate email registration', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/users`,
                body: testUser,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400)
                expect(response.body).to.have.property('message')
            })
        })
    })

    context('Contacts API', () => {
        it('should create a contact via API', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/contacts`,
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: testContact
            }).then((response) => {
                expect(response.status).to.eq(201)
                expect(response.body.firstName).to.eq(testContact.firstName)
                expect(response.body.lastName).to.eq(testContact.lastName)
                expect(response.body.email).to.eq(testContact.email)
                expect(response.body.phone).to.eq(testContact.phone)

                contactId = response.body._id
            })
        })

        it('should get all contacts via API', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/contacts`,
                headers: {
                    'Authorization': `Bearer ${authToken}`
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

        it('should get specific contact via API', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/contacts/${contactId}`,
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body._id).to.eq(contactId)
                expect(response.body.firstName).to.eq(testContact.firstName)
                expect(response.body.lastName).to.eq(testContact.lastName)
            })
        })

        it('should update contact via API', () => {
            const updatedContact = {
                firstName: 'Updated API',
                lastName: 'Updated Contact',
                phone: '5559876543'
            }

            cy.request({
                method: 'PUT',
                url: `${apiUrl}/contacts/${contactId}`,
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: updatedContact
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body.firstName).to.eq(updatedContact.firstName)
                expect(response.body.lastName).to.eq(updatedContact.lastName)
                expect(response.body.phone).to.eq(updatedContact.phone)
            })
        })

        it('should delete contact via API', () => {
            cy.request({
                method: 'DELETE',
                url: `${apiUrl}/contacts/${contactId}`,
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body).to.include('Contact deleted')
            })
        })

        it('should handle non-existent contact', () => {
            const fakeId = '507f1f77bcf86cd799439011'

            cy.request({
                method: 'GET',
                url: `${apiUrl}/contacts/${fakeId}`,
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(404)
            })
        })

        it('should validate required fields for contact creation', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/contacts`,
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: {
                    // Missing required firstName and lastName
                    email: 'incomplete@example.com'
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400)
            })
        })
    })

    context('Authentication & Authorization', () => {
        it('should require authentication for protected endpoints', () => {
            const protectedEndpoints = [
                { method: 'GET', url: '/contacts' },
                { method: 'POST', url: '/contacts' },
                { method: 'GET', url: '/users/me' },
                { method: 'PATCH', url: '/users/me' }
            ]

            protectedEndpoints.forEach(endpoint => {
                cy.request({
                    method: endpoint.method,
                    url: `${apiUrl}${endpoint.url}`,
                    failOnStatusCode: false
                }).then((response) => {
                    expect(response.status).to.eq(401)
                })
            })
        })

        it('should logout user via API', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/users/logout`,
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }).then((response) => {
                expect(response.status).to.eq(200)
            })
        })
    })

    // Cleanup
    after(() => {
        if (authToken && userId) {
            cy.request({
                method: 'DELETE',
                url: `${apiUrl}/users/me`,
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                failOnStatusCode: false
            })
        }
    })
})