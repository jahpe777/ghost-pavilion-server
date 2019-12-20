const EmailsService = {
    
    getAllEmails(knex) {
        return knex.select('*').from('subscribers')
    },

    insertEmail(knex, newEmail) {
        return knex
            .insert(newEmail)
            .into('subscribers')
            .returning('*')
            .then(rows => { 
                return rows[0]
            }) 
    },

    getById(knex, id) {
        return knex
            .from('subscribers')
            .select('*')
            .where('id', id)
            .first()
    },
}

module.exports = EmailsService