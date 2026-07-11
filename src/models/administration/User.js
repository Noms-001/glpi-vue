import BaseModel from "../BaseModel"

export default class User extends BaseModel {

    static resource = '/User'

    id = null

    name = ''

    realname = ''
    firstname = ''

    phone = ''
    phone2 = ''
    mobile = ''

    comment = ''

    locations_id = 0

    language = null

    use_mode = 0
    list_limit = 20

    is_active = false
    is_deleted = false

    auths_id = 0
    authtype = 0

    last_login = null

    entities_id = 0
    profiles_id = 0

    usertitles_id = 0
    usercategories_id = 0

    groups_id = 0
    users_id_supervisor = 0

    registration_number = ''

    password_last_update = null

    date_creation = null
    date_mod = null
    date_sync = null

    picture = null

    begin_date = null
    end_date = null

    timezone = null

    nickname = ''

    substitution_start_date = null
    substitution_end_date = null

    get fullName() {
        return `${this.firstname ?? ''} ${this.realname ?? ''}`.trim()
    }

    get displayName() {
        return this.fullName || this.name
    }
}