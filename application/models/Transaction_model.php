<?php

class Transaction_model extends CI_Model {

    private $schema = 'get_transaction';
    private $schema_object = 'get_account_object_transaction_list';
    private $schema_last = 'get_last_transaction';
    private $table  = 'silarakab.transaction';
    private $cud    = 'silarakab.main_cud';
    private $read   = 'silarakab.main_read';

    function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }
    
    function get_all($user, $limit, $offset, $order, $filter)
    {
        $setOrder = set_order($order);
        $sql = "SELECT * FROM {$this->read}($limit, $offset, '".$user['username']."', '".$this->schema."', '".$setOrder."', '[".json_encode($filter)."]'::JSONB)";
        $query = $this->db->query($sql);
        return model_response($query);
    }
    
    function get_last_transaction($user, $filter)
    {
        $sql = "SELECT * FROM {$this->read}(0, 0, '".$user['username']."', '".$this->schema_last."', '', '[".json_encode($filter)."]'::JSONB)";
        $query = $this->db->query($sql);
        return model_response($query);
    }
    
    function get_object_list($user, $filter)
    {
        $sql = "
            WITH r AS (
                SELECT * FROM {$this->read}(0, 0, '".$user['username']."', '".$this->schema_object."', 'label', '[".json_encode($filter)."]'::jsonb)
            ) SELECT 
                (r.__res_data->>'id')::INT AS id,
                (r.__res_data->>'id')::INT AS value, 
                CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label, (r.__res_data->>'label')), ') ', (r.__res_data->>'remark')) AS label,
                r.__code, 
                r.__res_msg, 
                COALESCE(r.__res_count,0)::INT AS __res_count
            FROM r
            JOIN silarakab.account_type at ON at.id=(r.__res_data->>'account_type_id')::INT AND at.active
            JOIN silarakab.account_group ag ON ag.id=at.account_group_id AND ag.active
            JOIN silarakab.account_base ab ON ab.id=ag.account_base_id AND ab.active
            WHERE (r.__res_data->>'active')::BOOLEAN
            ORDER BY ab.label,ag.label,at.label,(r.__res_data->>'label')
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

        $sql = "SELECT * from {$this->cud}('".$mode."', '{$this->table}', '".$user['username']."', '[".json_encode($params)."]'::JSONB)";
        $query = $this->db->query($sql,$params);
        return model_response($query, 2);
    }

    function delete($user, $params)
    {
        $sql = "SELECT * from {$this->cud}('D', '{$this->table}', '".$user['username']."', '[".json_encode($params)."]'::jsonb)";
        $query = $this->db->query($sql,$params);
        return model_response($query, 2);
    }
}
