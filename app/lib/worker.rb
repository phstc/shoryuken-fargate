class Worker
  include Shoryuken::Worker

  shoryuken_options queue: -> { ENV['QUEUE_NAME'] }, auto_delete: true

  def perform(_sqs_msgs, body)
    puts body
  end
end