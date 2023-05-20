<?php
defined('BASEPATH') or exit('No direct script access allowed');

class App extends CI_Controller {

	function __construct()
	{
		parent::__construct();
		$this->_authenticate_CORS();
	}

	public function index()
	{
		$this->load->view('app');
	}

	public function rest_server()
	{
        $this->load->helper('url');
        $this->load->view('rest_server');
	}

	public function ping()
	{
		$this->CI = &get_instance();
		$this->DB = $this->CI->load->database('default', true);
		$r = false;
		if (false !== $this->DB->conn_id) {
			$r = true;
		}
		echo json_encode(['status' => $r]);
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
