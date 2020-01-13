function makeShowsArray() {
    return [
      {
        id: 1,
        date: '01/13/2020',
        city: 'Los Angeles, CA',
        venue: 'Los Globos',
        created: '2017-01-09T00:25:17.235Z',
      },
      {
        id: 2,
        date: '01/13/2020',
        city: 'Los Angeles, CA',
        venue: 'El Cid',
        created: '2018-01-09T00:25:17.235Z',
      },
      {
        id: 3,
        date: '01/13/2020',
        city: 'Los Angeles, CA',
        venue: 'Silverlake Lounge',
        created: '2019-01-09T00:25:17.235Z',
      },
    ]
  }
  
  function makeMaliciousShow() {
    const maliciousShow = {
      id: 911,
      date: '01/13/2020',
      city: 'Naughty naughty very naughty <script>alert("xss");</script>',
      venue: 'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.'
    }
    const expectedShow = {
      ...maliciousShow,
      city: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      venue: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
      maliciousShow,
      expectedShow,
    }
  }
  
  module.exports = {
    makeShowsArray,
    makeMaliciousShow,
  }