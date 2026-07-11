import BaseModel from '../BaseModel'

export default class State extends BaseModel {

    static resource = '/State'

    id = 0

    name = ''
    completename = ''
    comment = ''

    entities_id = null

    is_recursive = false

    parents_id = null

    level = 0

    is_visible_helpdesk = false

    date_creation = null
    date_mod = null

    /**
     * @type {{
     *   computer: boolean,
     *   monitor: boolean,
     *   networkequipment: boolean,
     *   peripheral: boolean,
     *   phone: boolean,
     *   printer: boolean,
     *   softwarelicense: boolean,
     *   certificate: boolean,
     *   enclosure: boolean,
     *   pdu: boolean,
     *   line: boolean,
     *   rack: boolean,
     *   softwareversion: boolean,
     *   cluster: boolean,
     *   contract: boolean,
     *   appliance: boolean,
     *   databaseinstance: boolean,
     *   cable: boolean,
     *   unmanaged: boolean,
     *   passivedcequipment: boolean
     * }}
     */
    visibilities = {
        computer: false,
        monitor: false,
        networkequipment: false,
        peripheral: false,
        phone: false,
        printer: false,
        softwarelicense: false,
        certificate: false,
        enclosure: false,
        pdu: false,
        line: false,
        rack: false,
        softwareversion: false,
        cluster: false,
        contract: false,
        appliance: false,
        databaseinstance: false,
        cable: false,
        unmanaged: false,
        passivedcequipment: false
    }
}