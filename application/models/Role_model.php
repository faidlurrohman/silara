<?php

class Role_model extends CI_Model {

    private $schema = 'get_role';
    private $table  = 'silarakab.role';
    private $read   = 'silarakab.main_read';

    function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }

    function get_list($user)
    {
        $_json = '{"active":"true"}';
        $sql = "
            WITH r AS (
                SELECT * FROM {$this->read}(0, 0, '".$user['username']."', '".$this->schema."', 'remark', '[".$_json."]'::jsonb)
            ) SELECT 
                (r.__res_data->>'id')::INT AS id,
                (r.__res_data->>'id')::INT AS value, 
                r.__res_data->>'remark' AS label, 
                r.__code, 
                r.__res_msg, 
                COALESCE(r.__res_count,0)::INT AS __res_count
            FROM r
        ";
        $query = $this->db->query($sql);
        return model_response($query, 1);
    }

}
