<?php

class User_model extends CI_Model {

    function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }

    function get_all()
    {
        $sql = "
            with u as (
                select * from silarakab.user
            ) select u.*,count(*) over() as ttl_count from u
            order by u.id desc
        ";
        $query = $this->db->query($sql);
        return model_response($query);
    }

    function save($params)
    {
        $id = $params['id'];

        $sql_insert = "
            insert into silarakab.user
            (username,password,role_id,city_id,fullname,title,active)
            values ('".$params['username']."','".$params['password']."','".$params['role_id']."','".$params['city_id']."','".$params['fullname']."','".$params['title']."','".$params['active']."')
        ";

        $sql_update = "
            update silarakab.user
            set username = '".$params['username']."',
                password = '".$params['password']."',
                role_id = '".$params['role_id']."',
                city_id = '".$params['city_id']."',
                fullname = '".$params['fullname']."',
                title = '".$params['title']."',
                active = '".$params['active']."'
            where id = ".$id."
        ";

        $query = $this->db->query($id ? $sql_update : $sql_insert, $params);
        return model_response($query, 3);
    }

    function delete($params)
    {
        $sql = "
            delete from silarakab.user
            where id=?
        ";
        $query = $this->db->query($sql, $params);
        return model_response($query, 3);
    }

}
