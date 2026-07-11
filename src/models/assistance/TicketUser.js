import BaseModel from '../BaseModel'

export default class TicketUser extends BaseModel {

    static resource = '/Ticket_User'
    id = null

    tickets_id = 0
    users_id = 0
    type = 2

}