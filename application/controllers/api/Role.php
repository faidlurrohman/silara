<?php

defined('BASEPATH') or exit('No direct script access allowed');

require APPPATH . 'libraries/REST_Controller.php';
use Restserver\Libraries\REST_Controller;

class Role extends REST_Controller {

    function __construct()
    {
        parent::__construct();
        $this->_authenticate_CORS();
        $this->load->model('Role_model');
    }

    public function data_get()
    {
        $this->do_get_all();
    }

    private function do_get_all()
    {   
        $data = $this->Role_model->get_all();
     
        if ($data['r_code'] != 0) {
            $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
        } else {
            $this->response($data, REST_Controller::HTTP_OK);
        }
    }

    protected function _authenticate_CORS()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: ACCEPT, ORIGIN, X-REQUESTED-WITH, CONTENT-TYPE, AUTHORIZATION, Client-ID, Secret-Key, Authorization, User-ID');
        if ("OPTIONS" === $_SERVER['REQUEST_METHOD']) {
            die();
        }
    }

}
