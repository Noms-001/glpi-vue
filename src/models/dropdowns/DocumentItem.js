// models/dropdowns/DocumentItem.js

import BaseModel from '../BaseModel'

export default class DocumentItem extends BaseModel {

    static resource = '/Document_Item'

    id = null

    documents_id = null

    items_id = null

    itemtype = ''

    entities_id = 0

    is_recursive = 0

    date_mod = null

    users_id = 0

    timeline_position = 0

    date_creation = null

    date = null
}