<?php

class City_model extends CI_Model {

    private $schema = 'get_city';
    private $table  = 'silarakab.city';
    private $cud    = 'silarakab.main_cud';
    private $read   = 'silarakab.main_read';

    function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }

    function get_all($user)
    {
        $sql = "SELECT * FROM {$this->read}(0, 0, '".$user[0]['username']."', '".$this->schema."', '', '[{}]'::jsonb);";
        // echo $sql;exit;
        $query = $this->db->query($sql);
        return model_response($query);
    }

    function get_list()
    {
        $sql = "
            with a as (
                select * from silarakab.city
            ) select a.*,a.id as value,count(*) over() as ttl_count from a
            where a.active
            order by a.label asc
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

        $sql = "SELECT * from {$this->cud}('".$mode."', '{$this->table}', '".$user[0]['username']."', '[".json_encode($params)."]'::jsonb)";
        $query = $this->db->query($sql,$params);
        return model_response($query, 2);
    }

}
