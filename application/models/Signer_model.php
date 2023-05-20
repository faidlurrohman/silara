<?php

class Signer_model extends CI_Model {

    function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }

    function get_all()
    {
        $sql = "
            with a as (
                select * from silarakab.signer
            ) select a.*,count(*) over() as ttl_count from a
            order by a.id desc
        ";
        $query = $this->db->query($sql);
        return model_response($query);
    }

    function get_list()
    {
        $sql = "
            with a as (
                select * from silarakab.signer
            ) select a.*,a.id as value,count(*) over() as ttl_count from a
            where a.active
            order by a.label asc
        ";
        $query = $this->db->query($sql);
        return model_response($query);
    }

    function save($params)
    {
        $id = $params['id'];

        $sql_insert = "
            insert into silarakab.signer
            (nip,fullname,title,active)
            values ('".$params['nip']."','".$params['fullname']."','".$params['title']."','".$params['active']."')
        ";

        $sql_update = "
            update silarakab.signer
            set nip = '".$params['nip']."',
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
            delete from silarakab.signer
            where id=?
        ";
        $query = $this->db->query($sql, $params);
        return model_response($query, 3);
    }

}
