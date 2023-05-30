<?php

class Account_group_model extends CI_Model {

    private $schema = 'get_account_group';
    private $table  = 'silarakab.account_group';
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

    function get_list($user)
    {
        $sql = "
            WITH r AS (
                SELECT * FROM {$this->read}(0, 0, '".$user['username']."', '".$this->schema."', 'label', '[{}]'::jsonb)
            ) SELECT 
                (r.__res_data->>'id')::INT AS id,
                (r.__res_data->>'id')::INT AS value,
	            CONCAT('(',CONCAT_WS('.', ab.label, r.__res_data->>'label'), ') ', r.__res_data->>'remark') AS label, 
                r.__code, 
                r.__res_msg, 
                COALESCE(r.__res_count,0)::INT AS __res_count
            FROM r
            JOIN silarakab.account_base ab ON ab.id=(r.__res_data->>'account_base_id')::INT AND ab.active
            WHERE (r.__res_data->>'active')::BOOLEAN
            ORDER BY ab.label,(r.__res_data->>'label')
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

    function delete($user, $params)
    {
        $sql = "SELECT * from {$this->cud}('D', '{$this->table}', '".$user['username']."', '[".json_encode($params)."]'::jsonb)";
        $query = $this->db->query($sql,$params);
        return model_response($query, 2);
    }

}
