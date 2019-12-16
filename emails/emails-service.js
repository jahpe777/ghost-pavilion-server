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

    // deleteEmail(knex, id) {
    //     return knex('subscribers')
    //         .where('id', id)
    //         .delete()
    // },

    // updateEmail(knex, id, newEmail) {
    //     return knex('subscribers')
    //         .where({ id })
    //         .update(newEmail)
    // },
}

module.exports = EmailsService