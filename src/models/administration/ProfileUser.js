import BaseModel from "../BaseModel"

export default class ProfileUser extends BaseModel {
    static resource = '/Profile_User'

    id = null
    users_id = 0
    profiles_id = 0
    entities_id = 0
    is_recursive = 1
    is_dynamic = 0
    is_default_profile = 0
}