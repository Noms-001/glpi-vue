import BaseInventoryAsset from './BaseInventoryAsset'

export default class Monitor extends BaseInventoryAsset {

    static resource = '/Monitor'

    monitormodels_id = null
    monitortypes_id = null

    size = 0

    has_microphone = false
    has_speaker = false
    has_subd = false
    has_bnc = false
    has_dvi = false
    has_pivot = false
    has_hdmi = false
    has_displayport = false

    is_global = false

}