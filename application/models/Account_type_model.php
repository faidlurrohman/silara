<?php

class Account_type_model extends CI_Model {

    private $schema = 'get_account_type';
    private $table  = 'silarakab.account_type';
    private $cud    = 'silarakab.main_cud';
    private $read   = 'silarakab.main_read';

    function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }

    function get_all($user)
    {
        $_format = '{"account_group_label":"%s"}';
        $sql = "
            WITH r AS (
                SELECT * FROM {$this->read}(0, 0, '".$user['username']."', '".$this->schema."', '', '[{}]'::JSONB)
            ) SELECT 
                r.__code,
                COALESCE(r.__res_data,'{}'::JSONB) || FORMAT('".$_format."', a.label)::JSONB AS __res_data,
                r.__res_msg,
                r.__res_count
            FROM r
            JOIN silarakab.account_group a ON a.id=(r.__res_data->>'account_group_id')::INT
        ";
        $query = $this->db->query($sql);
        return model_response($query);
    }

    function get_list($user)
    {
        $_json = '{"active":"true"}';
        $sql = "
            WITH r AS (
                SELECT * FROM {$this->read}(0, 0, '".$user['username']."', '".$this->schema."', 'label', '[".$_json."]'::jsonb)
            ) SELECT 
                (r.__res_data->>'id')::INT AS id,
                (r.__res_data->>'id')::INT AS value, 
                r.__res_data->>'label' AS label, 
                r.__code, 
                r.__res_msg, 
                COALESCE(r.__res_count,0)::INT AS __res_count
            FROM r
        ";
        $query = $this->db->query($sql);
        return model_response($query, 1);
    }

    function save($user, $params)
    {
        $id = $params['id'];

        if ($id) {
            $mode = 'U';
        } else {
            $params["id"] = '0';
            $mode = 'C';
        }

        $sql = "SELECT * from {$this->cud}('".$mode."', '{$this->table}', '".$user['username']."', '[".json_encode($params)."]'::jsonb)";
        $query = $this->db->query($sql,$params);
        return model_response($query, 2);
    }

}
