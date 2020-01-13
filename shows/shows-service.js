const ShowsService = {
    
    getAllShows(knex) {
        return knex.select('*').from('shows')
    },

    insertShow(knex, newShow) {
        return knex
            .insert(newShow)
            .into('shows')
            .returning('*')
            .then(rows => { 
                return rows[0]
            }) 
    },

    getById(knex, id) {
        return knex
            .from('shows')
            .select('*')
            .where('id', id)
            .first()
    },

    deleteShow(knex, id) {
        return knex('shows')
            .where('id', id)
            .delete()
    },

    updateShow(knex, id, newShow) {
        return knex('shows')
            .where({ id })
            .update(newShow)
    },
}

module.exports = ShowsService