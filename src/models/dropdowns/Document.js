import BaseModel from '../BaseModel'

export default class Document extends BaseModel {

    static resource = '/Document'

    id = null

    entities_id = 0
    is_recursive = 0

    name = ''

    filename = null
    filepath = null

    documentcategories_id = 0

    mime = null

    date_mod = null
    date_creation = null

    comment = null

    is_deleted = 0

    link = null

    users_id = 0

    tickets_id = 0

    sha1sum = null

    is_blacklisted = 0

    tag = null
}