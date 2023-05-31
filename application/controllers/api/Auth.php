<?php

defined('BASEPATH') or exit('No direct script access allowed');

require APPPATH . 'libraries/REST_Controller.php';
use Restserver\Libraries\REST_Controller;

class Auth extends REST_Controller {

    function __construct()
    {
        parent::__construct();
        $this->_authenticate_CORS();
        $this->load->model('Auth_model');
    }

    public function index_get() 
    {
        echo '<br><br>eating some hamburger!!!';
    }

    public function login_post() 
    {
        $data = $this->Auth_model->login($this->post('username'),$this->post('password'));

        if ($data['code'] != 0) {
            $this->response($data, REST_Controller::HTTP_UNAUTHORIZED);
        } else {
            $auth = $this->Auth_model->get_auth($this->post('username'));
            $this->response($auth, REST_Controller::HTTP_OK);
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
