<?php

class Dashboard_model extends CI_Model {

    private $read   = 'silarakab.main_read';
    private $schema_dashboard = 'get_dashboard';
    private $schema_recap = 'get_dashboard_recap_years';

    function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }
    
    function get_dashboard($user, $limit, $offset, $order, $filter)
    {
        $setOrder = set_order($order);
        $sql = "SELECT * FROM {$this->read}($limit, $offset, '".$user['username']."', '".$this->schema_dashboard."', '".$setOrder."', '[".json_encode($filter)."]'::JSONB)";
        // echo $sql;exit;
        $query = $this->db->query($sql);
        return model_response($query);
    }
    
    function get_recap_years($user, $limit, $offset, $order, $filter)
    {
        $setOrder = set_order($order);
        $sql = "SELECT * FROM {$this->read}($limit, $offset, '".$user['username']."', '".$this->schema_recap."', '".$setOrder."', '[".json_encode($filter)."]'::JSONB)";
        // echo $sql;exit;
        $query = $this->db->query($sql);
        return model_response($query);
    }


}
