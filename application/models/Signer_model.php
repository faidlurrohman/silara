<?php

class Signer_model extends CI_Model {

    private $schema = 'get_signer';
    private $table  = 'silarakab.signer';
    private $cud    = 'silarakab.main_cud';
    private $read   = 'silarakab.main_read';

    function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }
    
    function get_all($user)
    {
        $sql = "SELECT * FROM {$this->read}(0, 0, '".$user['username']."', '".$this->schema."', '', '[{}]'::jsonb);";
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
