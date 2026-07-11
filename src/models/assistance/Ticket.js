import BaseModel from '../BaseModel'

export default class Ticket extends BaseModel {

    static resource = '/Ticket'

    id = null

    entities_id = 0

    name = ''
    content = ''

    date = null
    date_creation = null
    date_mod = null

    closedate = null
    solvedate = null

    takeintoaccountdate = null

    users_id_lastupdater = 0
    users_id_recipient = 0

    status = 1

    requesttypes_id = null

    urgency = 3
    impact = 3
    priority = 3

    itilcategories_id = 0

    type = 1

    global_validation = 1

    slas_id_ttr = 0
    slas_id_tto = 0
    slalevels_id_ttr = 0

    olas_id_ttr = 0
    olas_id_tto = 0
    olalevels_id_ttr = 0

    time_to_resolve = null
    time_to_own = null

    internal_time_to_resolve = null
    internal_time_to_own = null

    begin_waiting_date = null

    sla_waiting_duration = 0
    ola_waiting_duration = 0
    waiting_duration = 0

    ola_tto_begin_date = null
    ola_ttr_begin_date = null

    close_delay_stat = 0
    solve_delay_stat = 0
    takeintoaccount_delay_stat = 0

    actiontime = 0

    is_deleted = false

    locations_id = 0

    tickettemplates_id = 0

    externalid = 0

}