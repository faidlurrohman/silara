<?php

class Auth_model extends CI_Model {

    private $table = 'silarakab.user';

    function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }

    function login($username,$password)
    {
        $sql = "SELECT * FROM silarakab.check_auth('$username','$password')";
        $query = $this->db->query($sql);
        return model_response($query, 10);
    }

    public function get_auth($username)
    {
        $sql = "SELECT * FROM silarakab.get_auth('".$username."')";
        $query = $this->db->query($sql);
        return model_response($query, 10);
    }

    public function check_token()
    {        
        $token = get_token();
        $sql = "SELECT * FROM silarakab.user WHERE token='".$token."' AND active";
        $query = $this->db->query($sql);
        return model_response($query, 4);
    }

}
