<?php

class Transaction_model extends CI_Model {

    private $schema = 'get_transaction';
    private $table  = 'silarakab.transaction';
    private $cud    = 'silarakab.main_cud';
    private $read   = 'silarakab.main_read';

    function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }
    
    function get_all($user)
    {
        $_format = '{"city_label":"%1$s","account_object_label":"%2$s"}';
        $sql = "
            WITH r AS (
                SELECT * FROM {$this->read}(0, 0, '".$user['username']."', '".$this->schema."', '', '[{}]'::JSONB)
            ) SELECT 
                r.__code,
                COALESCE(r.__res_data,'{}'::JSONB) || FORMAT('".$_format."', c.label, a.label)::JSONB AS __res_data,
                r.__res_msg,
                r.__res_count
            FROM r
            JOIN silarakab.city c ON c.id=(r.__res_data->>'city_id')::INT
            JOIN silarakab.account_object a ON a.id=(r.__res_data->>'account_object_id')::INT
        ";
        $query = $this->db->query($sql);
        return model_response($query);
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
