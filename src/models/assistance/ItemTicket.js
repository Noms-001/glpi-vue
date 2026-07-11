// models/ItemTicket.js

import BaseModel from '../BaseModel'

export default class ItemTicket extends BaseModel {

    static resource = '/Item_Ticket'

    id = null

    itemtype = ''

    items_id = null

    tickets_id = null

}