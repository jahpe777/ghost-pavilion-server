function makeEmailsArray() {
    return [
      {
        id: 1,
        email: 'james@gmail.com',
        created: '2019-01-09T00:25:17.235Z',
      },
      {
        id: 2,
        email: 'yeong@gmail.com',
        created: '2018-01-09T00:25:17.235Z',
      },
      {
        id: 3,
        email: 'higgs@gmail.com',
        created: '2017-01-09T00:25:17.235Z',
      },
    ]
  }
  
  function makeMaliciousEmail() {
    const maliciousEmail = {
      id: 4,
      email: 'Naughty naughty very naughty <script>alert("xss");</script>',
    }
    const expectedEmail = {
      ...maliciousEmail,
      email: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    }
    return {
      maliciousEmail,
      expectedEmail,
    }
  }
  
  module.exports = {
    makeEmailsArray,
    makeMaliciousEmail,
  }