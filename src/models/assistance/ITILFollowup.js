import BaseModel from '../BaseModel'

export default class ITILFollowup extends BaseModel {
    static resource = '/ITILFollowup'

    id = null
    itemtype = 'Ticket'
    items_id = 0
    content = ''
    is_private = 0
}