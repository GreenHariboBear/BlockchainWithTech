require 'net/http'
require 'json'

class PagesController < ApplicationController

	$username = ""
	$dataList = Array.new

	def dashboard
		$username=params[:username]
		if($username != nil)
			puts "dashboard---------"+$username
		end
	end


	def CRUD
		resourceup = params[:resup]
		if(resourceup != nil)
			resourceup_name = resourceup["name"]
			puts "resourceup name --------- "+resourceup_name
			invoke("uploaded "+resourceup_name)
		end

		resourcedown = params[:resdown]
		if(resourcedown != nil)
			puts "resourcedown name --------- "+resourcedown
			invoke("downloaded "+resourcedown)
		end
	end


	def invoke(action)
		uri = URI('http://139.59.89.51:443/submitLog')

		http = Net::HTTP.new(uri.host, uri.port)
		req = Net::HTTP::Post.new(uri.path, {'Content-Type' =>'application/json', 'Authorization' => 'XXXXXXXXXXXXXXXX'})

		time = Time.now.inspect
		obj = {:worldID => "123", :email => $username, :role => "Student", :action => action, :timestamp => time}
		req.body = JSON.generate(obj)
		res = http.request(req)

		puts "post response --------- #{res.body}"

	rescue => e
	    puts "failed #{e}"
	end


	def logs
		queryUser = params[:queryUser]
		if(queryUser != nil)
			puts "queryUser name --------- "+queryUser
			query(queryUser)
		end
	end


	def query(queryUser)
		domain_uri = 'http://139.59.89.51:443/submitUsername/'+queryUser

		uri = URI(domain_uri)
		req = Net::HTTP::Get.new(uri)

		res = Net::HTTP.start(uri.host, uri.port) {|http|
			http.request(req)}

		$dataList = JSON.parse(res.body)["result"]["data"]
		puts "get response --------- #{res.body}"

	rescue => e
		puts "failed #{e}"
	end

end