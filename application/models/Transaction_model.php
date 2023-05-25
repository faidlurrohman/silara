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
    
    function get_all($user, $limit, $offset, $order, $filter)
    {
        $setOrder = set_order($order);
        $sql = "SELECT * FROM {$this->read}($limit, $offset, '".$user['username']."', '".$this->schema."', '".$setOrder."', '[".json_encode($filter)."]'::JSONB)";
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

        $sql = "SELECT * from {$this->cud}('".$mode."', '{$this->table}', '".$user['username']."', '[".json_encode($params)."]'::JSONB)";
        $query = $this->db->query($sql,$params);
        return model_response($query, 2);
    }

}
