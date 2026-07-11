import BaseModel from '../BaseModel'

export default class TicketCost extends BaseModel {

    static resource = '/TicketCost'
    id = null

    tickets_id = 0
    budgets_id = 0
    entities_id = 0

    name = ''
    comment = ''

    begin_date = null
    end_date = null

    actiontime = 0

    cost_time = 0
    cost_fixed = 0
    cost_material = 0

}