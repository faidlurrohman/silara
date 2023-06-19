<?php

class Report_model extends CI_Model {

    private $read   = 'silarakab.main_read';
    private $schema_real_plan_cities = 'get_real_plan_cities';
    private $schema_recapitulation_cities = 'get_recapitulation_cities';

    function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }
    
    function get_real_plan_cities($user, $limit, $offset, $order, $filter)
    {
        $setOrder = set_order($order);
        $sql = "SELECT * FROM {$this->read}($limit, $offset, '".$user['username']."', '".$this->schema_real_plan_cities."', '".$setOrder."', '[".json_encode($filter)."]'::JSONB)";
        // echo $sql;exit;
        $query = $this->db->query($sql);
        return model_response($query);
    }

    function get_recapitulation_cities($user, $limit, $offset, $order, $filter)
    {
        $setOrder = set_order($order);
        $sql = "SELECT * FROM {$this->read}($limit, $offset, '".$user['username']."', '".$this->schema_recapitulation_cities."', '".$setOrder."', '[".json_encode($filter)."]'::JSONB)";
        // echo $sql;exit;
        $query = $this->db->query($sql);
        return model_response($query);
    }

}
